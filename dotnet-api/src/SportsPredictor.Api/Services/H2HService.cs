using SportsPredictor.Api.Models;

namespace SportsPredictor.Api.Services;

/// <summary>
/// Deterministic head-to-head history and 5-match form engine. The same xorshift seed is
/// derived from the fixture, so every reload and both backends produce identical records.
/// </summary>
public static class H2HService
{
    private static readonly Dictionary<string, string[]> FormOpponents = new()
    {
        ["cricket"] = new[] { "India", "Australia", "England", "New Zealand", "Pakistan", "Sri Lanka" },
        ["basketball"] = new[] { "Boston Celtics", "Golden State Warriors", "Milwaukee Bucks", "Denver Nuggets", "Miami Heat" },
        ["nfl"] = new[] { "Kansas City Chiefs", "Buffalo Bills", "San Francisco 49ers", "Dallas Cowboys", "Philadelphia Eagles" },
        ["rugby"] = new[] { "New Zealand", "Australia", "England", "Ireland", "France", "Argentina" },
        ["football"] = new[] { "Manchester City", "Liverpool", "Chelsea", "Tottenham", "Newcastle", "Aston Villa" },
    };

    private sealed class Xorshift32
    {
        private uint _state;

        public Xorshift32(uint seed) => _state = seed == 0 ? 0x9e3779b9u : seed;

        public double Next()
        {
            _state ^= _state << 13;
            _state ^= _state >> 17;
            _state ^= _state << 5;
            if (_state == 0) _state = 0x9e3779b9u;
            return _state / 4294967296.0;
        }
    }

    public static HeadToHeadRecord Build(string homeTeam, string awayTeam, string sportTitle = "")
    {
        var family = SportFamily(sportTitle);
        var rng = new Xorshift32(Hash32($"{homeTeam}|{awayTeam}|{family}"));

        var previousMatches = new List<H2HMatch>();
        var homeWins = 0;
        var awayWins = 0;
        var draws = 0;
        var totalScore = 0;

        for (var i = 0; i < 5; i++)
        {
            var queriedHomeIsHost = i % 2 == 0;
            var matchHome = queriedHomeIsHost ? homeTeam : awayTeam;
            var matchAway = queriedHomeIsHost ? awayTeam : homeTeam;
            var homeScore = RandomScore(family, rng);
            var awayScore = RandomScore(family, rng);

            var winner = "draw";
            if (homeScore > awayScore) winner = "home";
            else if (awayScore > homeScore) winner = "away";

            if (winner == "draw") draws++;
            else if ((winner == "home" && queriedHomeIsHost) || (winner == "away" && !queriedHomeIsHost)) homeWins++;
            else awayWins++;

            totalScore += homeScore + awayScore;
            previousMatches.Add(new H2HMatch
            {
                Date = IsoDaysAgo(i * 14),
                HomeTeam = matchHome,
                AwayTeam = matchAway,
                HomeScore = homeScore,
                AwayScore = awayScore,
                Winner = winner,
            });
        }

        return new HeadToHeadRecord
        {
            PreviousMatches = previousMatches,
            HomeForm = BuildForm(homeTeam, family, rng),
            AwayForm = BuildForm(awayTeam, family, rng),
            H2HSummary = new H2HSummary
            {
                HomeWins = homeWins,
                AwayWins = awayWins,
                Draws = draws,
                TotalMatches = previousMatches.Count,
                AvgScore = Math.Round(totalScore / (double)previousMatches.Count * 10, MidpointRounding.AwayFromZero) / 10,
            },
        };
    }

    public static double FormProbabilityDelta(List<FormEntry> homeForm, List<FormEntry> awayForm, double weight = 1)
    {
        return (FormPoints(homeForm) - FormPoints(awayForm)) / 5 * 0.06 * weight;
    }

    public static string FormString(IEnumerable<FormEntry> form) => string.Join("-", form.Select(f => f.Result));

    private static double FormPoints(IEnumerable<FormEntry> form)
    {
        return form.Sum(entry => entry.Result == "W" ? 1 : entry.Result == "D" ? 0.5 : 0);
    }

    private static List<FormEntry> BuildForm(string team, string family, Xorshift32 rng)
    {
        var pool = FormOpponents.TryGetValue(family, out var set) ? set : FormOpponents["football"];
        var entries = new List<FormEntry>();

        for (var i = 0; i < 5; i++)
        {
            var opponent = pool[(int)(rng.Next() * pool.Length)];
            if (opponent == team)
            {
                opponent = pool[(Array.IndexOf(pool, opponent) + 1) % pool.Length];
            }

            var teamScore = RandomScore(family, rng);
            var opponentScore = RandomScore(family, rng);
            var result = teamScore > opponentScore ? "W" : teamScore < opponentScore ? "L" : "D";

            entries.Add(new FormEntry
            {
                Result = result,
                Opponent = opponent,
                Score = $"{teamScore}-{opponentScore}",
                Date = IsoDaysAgo(7 + i * 7),
            });
        }

        return entries;
    }

    private static uint Hash32(string value)
    {
        unchecked
        {
            var hash = 2166136261u;
            foreach (var c in value)
            {
                hash ^= c;
                hash *= 16777619;
            }
            return hash;
        }
    }

    private static string SportFamily(string sportTitle)
    {
        var sport = (sportTitle ?? "").ToLowerInvariant();
        if (sport.Contains("cricket")) return "cricket";
        if (sport.Contains("basketball") || sport.Contains("nba")) return "basketball";
        if (sport.Contains("nfl") || sport.Contains("american football")) return "nfl";
        if (sport.Contains("rugby")) return "rugby";
        return "football";
    }

    private static int RandomScore(string family, Xorshift32 rng)
    {
        return family switch
        {
            "cricket" => 110 + (int)(rng.Next() * 111),
            "basketball" => 88 + (int)(rng.Next() * 41),
            "nfl" => 10 + (int)(rng.Next() * 28),
            _ => (int)(rng.Next() * 5),
        };
    }

    private static string IsoDaysAgo(int days)
    {
        var date = new DateTime(2026, 10, 18, 0, 0, 0, DateTimeKind.Utc).AddDays(-days);
        return date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
    }
}

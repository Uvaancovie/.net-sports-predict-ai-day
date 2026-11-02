using System.Text.Json;
using SportsPredictor.Api.Models;

namespace SportsPredictor.Api.Services;

/// <summary>
/// L3 fallback tier: seeded demo fixtures served with zero Odds API credits when the
/// quota floor is reached, the breaker is open, or the network is unavailable.
/// </summary>
public static class DemoData
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    private static string Iso(DateTime dt) =>
        DateTime.SpecifyKind(dt, DateTimeKind.Utc).ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

    public static JsonElement SportsElement() => JsonSerializer.SerializeToElement(Sports(), Options);

    private static List<SportDto> Sports() => new()
    {
        new SportDto { Key = "upcoming", Group = "Featured", Title = "Upcoming Matches (All Sports)", Description = "Live & next upcoming games across all major leagues", Active = true },
        new SportDto { Key = "soccer_epl", Group = "Soccer", Title = "English Premier League", Description = "English Premier League Football", Active = true },
        new SportDto { Key = "cricket_test_match", Group = "Cricket", Title = "Test Matches", Description = "International Cricket Test Matches", Active = true },
        new SportDto { Key = "basketball_nba", Group = "Basketball", Title = "NBA", Description = "US National Basketball Association", Active = true },
        new SportDto { Key = "rugbyleague_nrl", Group = "Rugby League", Title = "NRL & Rugby Union", Description = "Rugby League & South African Rugby Championship", Active = true },
        new SportDto { Key = "americanfootball_nfl", Group = "American Football", Title = "NFL", Description = "US Football", Active = true },
        new SportDto { Key = "tennis_atp_french_open", Group = "Tennis", Title = "ATP Tennis", Description = "Men's Professional Tennis Tour", Active = true },
    };

    public static JsonElement EventsElement(string sport)
    {
        var events = Events();
        var filtered = sport == "upcoming"
            ? events
            : events.Where(e => e.SportKey == sport).ToList();

        return JsonSerializer.SerializeToElement(filtered.Count > 0 ? filtered : events, Options);
    }

    private static List<OddsEventDto> Events()
    {
        var now = DateTime.UtcNow;

        return new List<OddsEventDto>
        {
            new()
            {
                Id = "demo-match-epl-01",
                SportKey = "soccer_epl",
                SportTitle = "English Premier League",
                CommenceTime = Iso(now.AddHours(24)),
                HomeTeam = "Arsenal",
                AwayTeam = "Chelsea",
                Bookmakers = new List<OddsBookmakerDto>
                {
                    Bookmaker("draftkings", "DraftKings", now, ("Arsenal", 1.85), ("Draw", 3.75), ("Chelsea", 4.2)),
                    Bookmaker("betmgm", "BetMGM", now, ("Arsenal", 1.9), ("Draw", 3.6), ("Chelsea", 4.35)),
                    Bookmaker("betonlineag", "BetOnline", now, ("Arsenal", 1.88), ("Draw", 3.8), ("Chelsea", 4.1)),
                },
            },
            new()
            {
                Id = "demo-match-cricket-01",
                SportKey = "cricket_test_match",
                SportTitle = "International Cricket",
                CommenceTime = Iso(now.AddHours(48)),
                HomeTeam = "South Africa",
                AwayTeam = "India",
                Bookmakers = new List<OddsBookmakerDto>
                {
                    Bookmaker("betfair", "Betfair", now, ("South Africa", 2.1), ("Draw", 5.5), ("India", 2.05)),
                    Bookmaker("unibet", "Unibet", now, ("South Africa", 2.15), ("Draw", 5.2), ("India", 2.0)),
                },
            },
            new()
            {
                Id = "demo-match-nba-01",
                SportKey = "basketball_nba",
                SportTitle = "NBA",
                CommenceTime = Iso(now.AddHours(6)),
                HomeTeam = "Boston Celtics",
                AwayTeam = "Golden State Warriors",
                Bookmakers = new List<OddsBookmakerDto>
                {
                    Bookmaker("fanduel", "FanDuel", now, ("Boston Celtics", 1.52), ("Golden State Warriors", 2.65)),
                    Bookmaker("draftkings", "DraftKings", now, ("Boston Celtics", 1.55), ("Golden State Warriors", 2.6)),
                },
            },
        };
    }

    private static OddsBookmakerDto Bookmaker(string key, string title, DateTime now, params (string Name, double Price)[] outcomes) => new()
    {
        Key = key,
        Title = title,
        LastUpdate = Iso(now),
        Markets = new List<OddsMarketDto>
        {
            new()
            {
                Key = "h2h",
                Outcomes = outcomes.Select(o => new OddsOutcomeDto { Name = o.Name, Price = o.Price }).ToList(),
            },
        },
    };
}

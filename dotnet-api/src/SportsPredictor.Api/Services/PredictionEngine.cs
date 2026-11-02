using SportsPredictor.Api.Models;

namespace SportsPredictor.Api.Services;

/// <summary>
/// Pure C# port of the Node prediction math engine: vig stripping, home-advantage
/// adjustment, +EV scanning with fractional Kelly sizing, Poisson goal sampling and
/// a 10,000-run Monte Carlo. No network calls — predictions never consume Odds API credits.
/// </summary>
public sealed class PredictionEngine
{
    private static double Round1(double value) => Math.Round(value * 10, MidpointRounding.AwayFromZero) / 10;
    private static double Round2(double value) => Math.Round(value * 100, MidpointRounding.AwayFromZero) / 100;

    private static double CalculatePoisson(int k, double lambda)
    {
        double factorial = 1;
        for (var i = 2; i <= k; i++) factorial *= i;
        return Math.Pow(lambda, k) * Math.Exp(-lambda) / factorial;
    }

    private static int SamplePoisson(double lambda)
    {
        var p = Random.Shared.NextDouble();
        double cumulative = 0;
        for (var k = 0; k <= 7; k++)
        {
            cumulative += CalculatePoisson(k, lambda);
            if (p <= cumulative) return k;
        }
        return 0;
    }

    private static MonteCarloResult RunMonteCarloSimulation(
        double probHome,
        double probAway,
        double? probDraw,
        int iterations,
        double expGoalsHome,
        double expGoalsAway)
    {
        _ = probHome;
        _ = probAway;
        _ = probDraw;

        var homeWins = 0;
        var awayWins = 0;
        var draws = 0;
        var scorelineMap = new Dictionary<string, int>();

        for (var i = 0; i < iterations; i++)
        {
            var goalsHome = SamplePoisson(expGoalsHome);
            var goalsAway = SamplePoisson(expGoalsAway);

            if (goalsHome > goalsAway) homeWins++;
            else if (goalsAway > goalsHome) awayWins++;
            else draws++;

            var key = $"{goalsHome}-{goalsAway}";
            scorelineMap[key] = scorelineMap.GetValueOrDefault(key) + 1;
        }

        var simulatedScorelines = scorelineMap
            .Select(kv => new SimulatedScoreline
            {
                Score = kv.Key,
                Count = kv.Value,
                Pct = Round1((double)kv.Value / iterations * 100),
            })
            .OrderByDescending(s => s.Count)
            .Take(5)
            .ToList();

        return new MonteCarloResult
        {
            Iterations = iterations,
            HomeWins = homeWins,
            AwayWins = awayWins,
            Draws = draws,
            HomeWinPct = Round1((double)homeWins / iterations * 100),
            AwayWinPct = Round1((double)awayWins / iterations * 100),
            DrawPct = Round1((double)draws / iterations * 100),
            SimulatedScorelines = simulatedScorelines,
        };
    }

    public PredictionResult Analyze(OddsEventDto evt, SimulateOptionsDto? options = null)
    {
        var homeTeam = evt.HomeTeam;
        var awayTeam = evt.AwayTeam;
        var sportTitle = string.IsNullOrWhiteSpace(evt.SportTitle) ? "Sports Event" : evt.SportTitle;

        var homePrices = new List<double>();
        var awayPrices = new List<double>();
        var drawPrices = new List<double>();
        var valueBets = new List<ValueBet>();

        foreach (var bookmaker in evt.Bookmakers ?? new List<OddsBookmakerDto>())
        {
            var h2h = bookmaker.Markets?.FirstOrDefault(m => m.Key == "h2h");
            if (h2h is null) continue;

            foreach (var outcome in h2h.Outcomes)
            {
                var decPrice = NormalizePrice(outcome.Price);
                if (outcome.Name == homeTeam) homePrices.Add(decPrice);
                else if (outcome.Name == awayTeam) awayPrices.Add(decPrice);
                else if (outcome.Name.Equals("draw", StringComparison.OrdinalIgnoreCase) ||
                         outcome.Name.Equals("tie", StringComparison.OrdinalIgnoreCase))
                {
                    drawPrices.Add(decPrice);
                }
            }
        }

        var avgHome = homePrices.Count > 0 ? homePrices.Average() : 1.95;
        var avgAway = awayPrices.Count > 0 ? awayPrices.Average() : 2.85;
        var hasDraw = drawPrices.Count > 0;
        var avgDraw = hasDraw ? drawPrices.Average() : (double?)null;

        var rawHomeProb = 1 / avgHome;
        var rawAwayProb = 1 / avgAway;
        var rawDrawProb = avgDraw.HasValue ? 1 / avgDraw.Value : 0;
        var totalOverround = rawHomeProb + rawAwayProb + rawDrawProb;
        var overroundPercent = Round1((totalOverround - 1) * 100);

        var trueHomeProb = rawHomeProb / totalOverround;
        var trueAwayProb = rawAwayProb / totalOverround;
        var trueDrawProb = hasDraw ? rawDrawProb / totalOverround : (double?)null;

        var homeAdvantage = (options?.HomeAdvantage ?? 4) / 100;
        var adjustedHomeProb = Math.Min(0.95, Math.Max(0.05, trueHomeProb + homeAdvantage * 0.3));
        var remainingProb = 1 - adjustedHomeProb;

        double adjustedAwayProb;
        double? adjustedDrawProb;
        if (trueDrawProb.HasValue)
        {
            var denominator = trueAwayProb + trueDrawProb.Value;
            adjustedAwayProb = remainingProb * (trueAwayProb / denominator);
            adjustedDrawProb = remainingProb * (trueDrawProb.Value / denominator);
        }
        else
        {
            adjustedAwayProb = remainingProb;
            adjustedDrawProb = null;
        }

        var fairOddsHome = Round2(1 / adjustedHomeProb);
        var fairOddsAway = Round2(1 / adjustedAwayProb);

        foreach (var bookmaker in evt.Bookmakers ?? new List<OddsBookmakerDto>())
        {
            var h2h = bookmaker.Markets?.FirstOrDefault(m => m.Key == "h2h");
            if (h2h is null) continue;

            foreach (var outcome in h2h.Outcomes)
            {
                var decPrice = NormalizePrice(outcome.Price);

                var targetProb = outcome.Name == homeTeam
                    ? adjustedHomeProb
                    : outcome.Name == awayTeam
                        ? adjustedAwayProb
                        : adjustedDrawProb ?? 0;

                var targetFair = outcome.Name == homeTeam ? fairOddsHome : fairOddsAway;

                var ev = targetProb * decPrice - 1;
                if (ev > 0.015)
                {
                    var b = decPrice - 1;
                    var kelly = (b * targetProb - (1 - targetProb)) / b;
                    valueBets.Add(new ValueBet
                    {
                        Team = outcome.Name,
                        Bookmaker = bookmaker.Title,
                        OfferedOdds = Round2(decPrice),
                        TrueOdds = targetFair,
                        ExpectedValuePct = Round1(ev * 100),
                        KellyStakePct = Round1(Math.Max(0, kelly * 0.25) * 100),
                    });
                }
            }
        }

        var predictedWinner = "home";
        if (adjustedAwayProb > adjustedHomeProb && (!adjustedDrawProb.HasValue || adjustedAwayProb > adjustedDrawProb.Value))
        {
            predictedWinner = "away";
        }
        else if (adjustedDrawProb.HasValue && adjustedDrawProb.Value > adjustedHomeProb && adjustedDrawProb.Value > adjustedAwayProb)
        {
            predictedWinner = "draw";
        }

        var confidenceScore = (int)Math.Round(
            Math.Max(adjustedHomeProb, Math.Max(adjustedAwayProb, adjustedDrawProb ?? 0)) * 100,
            MidpointRounding.AwayFromZero);

        var expGoalsHome = Round2(1.2 + (adjustedHomeProb - 0.4) * 2.2);
        var expGoalsAway = Round2(1.0 + (adjustedAwayProb - 0.4) * 1.8);

        var iterations = options?.Iterations is > 0 ? options.Iterations!.Value : 10000;
        var monteCarlo = RunMonteCarloSimulation(
            adjustedHomeProb, adjustedAwayProb, adjustedDrawProb,
            iterations, expGoalsHome, expGoalsAway);

        var riskLevel = confidenceScore > 65 ? "Low" : confidenceScore > 48 ? "Medium" : "High";

        var keyFactors = new List<string>
        {
            $"Market consensus assigns {homeTeam} {fairOddsHome} fair true decimal odds.",
            $"Poisson model estimates {expGoalsHome} to {expGoalsAway} scoring ratio in standard game conditions.",
            $"10,000 Monte Carlo runs indicate {monteCarlo.HomeWins} home wins, {monteCarlo.AwayWins} away wins, and {monteCarlo.Draws} draws.",
            valueBets.Count > 0
                ? $"Value alert: Detected +EV opportunity on {valueBets[0].Team} at {valueBets[0].OfferedOdds} with {valueBets[0].ExpectedValuePct}% positive margin."
                : "Consensus market prices are tightly aligned with implied probabilities with no major bookmaker inefficiencies.",
        };

        return new PredictionResult
        {
            MatchId = evt.Id,
            HomeTeam = homeTeam,
            AwayTeam = awayTeam,
            SportTitle = sportTitle,
            CommenceTime = evt.CommenceTime,
            ConsensusOdds = new ConsensusOdds
            {
                Home = Round2(avgHome),
                Away = Round2(avgAway),
                Draw = avgDraw.HasValue ? Round2(avgDraw.Value) : null,
            },
            RawImpliedProb = new ProbabilityTriplet
            {
                Home = Round1(rawHomeProb * 100),
                Away = Round1(rawAwayProb * 100),
                Draw = avgDraw.HasValue ? Round1(rawDrawProb * 100) : null,
            },
            TrueProbabilities = new ProbabilityTriplet
            {
                Home = Round1(adjustedHomeProb * 100),
                Away = Round1(adjustedAwayProb * 100),
                Draw = adjustedDrawProb.HasValue ? Round1(adjustedDrawProb.Value * 100) : null,
            },
            OverroundPercent = overroundPercent,
            PredictedWinner = predictedWinner,
            ConfidenceScore = confidenceScore,
            ExpectedGoals = new ExpectedGoals { Home = expGoalsHome, Away = expGoalsAway },
            MonteCarlo = monteCarlo,
            ValueBets = valueBets.Take(4).ToList(),
            TacticalAnalysis = new TacticalAnalysis
            {
                Summary = $"{homeTeam} holds a projected {Math.Round(adjustedHomeProb * 100)}% win likelihood vs {awayTeam} ({Math.Round(adjustedAwayProb * 100)}%), reflecting consensus bookmaker market pricing after stripping a {overroundPercent}% vigorish fee.",
                KeyFactors = keyFactors,
                RiskLevel = riskLevel,
            },
        };
    }

    private static double NormalizePrice(double price)
    {
        // American odds → decimal
        if (price > 50) return 1 + price / 100;
        if (price < -50) return 1 + 100 / Math.Abs(price);
        return price;
    }
}

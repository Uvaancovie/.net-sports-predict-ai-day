namespace SportsPredictor.Api.Models;

using System.Text.Json.Serialization;

public sealed class FormEntry
{
    public string Result { get; set; } = "D";
    public string Opponent { get; set; } = "";
    public string Score { get; set; } = "";
    public string Date { get; set; } = "";
}

public sealed class H2HMatch
{
    public string Date { get; set; } = "";
    public string HomeTeam { get; set; } = "";
    public string AwayTeam { get; set; } = "";
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public string Winner { get; set; } = "draw";
}

public sealed class H2HSummary
{
    public int HomeWins { get; set; }
    public int AwayWins { get; set; }
    public int Draws { get; set; }
    public int TotalMatches { get; set; }
    public double AvgScore { get; set; }
}

public sealed class HeadToHeadRecord
{
    public List<H2HMatch> PreviousMatches { get; set; } = new();
    public List<FormEntry> HomeForm { get; set; } = new();
    public List<FormEntry> AwayForm { get; set; } = new();

    [JsonPropertyName("h2hSummary")]
    public H2HSummary H2HSummary { get; set; } = new();
}

public sealed class ConsensusOdds
{
    public double Home { get; set; }
    public double Away { get; set; }
    public double? Draw { get; set; }
}

public sealed class ProbabilityTriplet
{
    public double Home { get; set; }
    public double Away { get; set; }
    public double? Draw { get; set; }
}

public sealed class ExpectedGoals
{
    public double Home { get; set; }
    public double Away { get; set; }
}

public sealed class SimulatedScoreline
{
    public string Score { get; set; } = "";
    public int Count { get; set; }
    public double Pct { get; set; }
}

public sealed class MonteCarloResult
{
    public int Iterations { get; set; }
    public int HomeWins { get; set; }
    public int AwayWins { get; set; }
    public int Draws { get; set; }
    public double HomeWinPct { get; set; }
    public double AwayWinPct { get; set; }
    public double DrawPct { get; set; }
    public List<SimulatedScoreline> SimulatedScorelines { get; set; } = new();
}

public sealed class ValueBet
{
    public string Team { get; set; } = "";
    public string Bookmaker { get; set; } = "";
    public double OfferedOdds { get; set; }
    public double TrueOdds { get; set; }
    public double ExpectedValuePct { get; set; }
    public double KellyStakePct { get; set; }
}

public sealed class TacticalAnalysis
{
    public string Summary { get; set; } = "";
    public List<string> KeyFactors { get; set; } = new();
    public string RiskLevel { get; set; } = "Medium";
}

public sealed class PredictionResult
{
    public string MatchId { get; set; } = "";
    public string HomeTeam { get; set; } = "";
    public string AwayTeam { get; set; } = "";
    public string SportTitle { get; set; } = "";
    public string CommenceTime { get; set; } = "";
    public ConsensusOdds ConsensusOdds { get; set; } = new();
    public ProbabilityTriplet RawImpliedProb { get; set; } = new();
    public ProbabilityTriplet TrueProbabilities { get; set; } = new();
    public double OverroundPercent { get; set; }
    public string PredictedWinner { get; set; } = "home";
    public int ConfidenceScore { get; set; }
    public ExpectedGoals? ExpectedGoals { get; set; }
    public MonteCarloResult MonteCarlo { get; set; } = new();
    public List<ValueBet> ValueBets { get; set; } = new();
    public TacticalAnalysis TacticalAnalysis { get; set; } = new();

    [JsonPropertyName("h2h")]
    public HeadToHeadRecord? H2H { get; set; }

    [JsonPropertyName("formAdjustment")]
    public double FormAdjustment { get; set; }
}

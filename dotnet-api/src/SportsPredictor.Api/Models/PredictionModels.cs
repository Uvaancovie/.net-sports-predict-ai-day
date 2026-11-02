namespace SportsPredictor.Api.Models;

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
}

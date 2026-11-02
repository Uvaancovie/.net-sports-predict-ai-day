using System.Text.Json.Serialization;

namespace SportsPredictor.Api.Models;

public sealed class SportDto
{
    [JsonPropertyName("key")] public string Key { get; set; } = "";
    [JsonPropertyName("group")] public string Group { get; set; } = "";
    [JsonPropertyName("title")] public string Title { get; set; } = "";
    [JsonPropertyName("description")] public string Description { get; set; } = "";
    [JsonPropertyName("active")] public bool Active { get; set; }
    [JsonPropertyName("has_outrights")] public bool HasOutrights { get; set; }
}

public sealed class OddsOutcomeDto
{
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("price")] public double Price { get; set; }
    [JsonPropertyName("point")] public double? Point { get; set; }
    [JsonPropertyName("description")] public string? Description { get; set; }
}

public sealed class OddsMarketDto
{
    [JsonPropertyName("key")] public string Key { get; set; } = "";
    [JsonPropertyName("last_update")] public string? LastUpdate { get; set; }
    [JsonPropertyName("outcomes")] public List<OddsOutcomeDto> Outcomes { get; set; } = new();
}

public sealed class OddsBookmakerDto
{
    [JsonPropertyName("key")] public string Key { get; set; } = "";
    [JsonPropertyName("title")] public string Title { get; set; } = "";
    [JsonPropertyName("last_update")] public string LastUpdate { get; set; } = "";
    [JsonPropertyName("markets")] public List<OddsMarketDto> Markets { get; set; } = new();
}

public sealed class OddsEventDto
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("sport_key")] public string SportKey { get; set; } = "";
    [JsonPropertyName("sport_title")] public string SportTitle { get; set; } = "";
    [JsonPropertyName("commence_time")] public string CommenceTime { get; set; } = "";
    [JsonPropertyName("home_team")] public string HomeTeam { get; set; } = "";
    [JsonPropertyName("away_team")] public string AwayTeam { get; set; } = "";
    [JsonPropertyName("bookmakers")] public List<OddsBookmakerDto> Bookmakers { get; set; } = new();
}

public sealed class QuotaInfo
{
    [JsonPropertyName("remaining")] public int Remaining { get; set; }
    [JsonPropertyName("used")] public int Used { get; set; }
    [JsonPropertyName("lastCost")] public int LastCost { get; set; }
    [JsonPropertyName("isCached")] public bool IsCached { get; set; }
    [JsonPropertyName("ttlRemaining")] public int? TtlRemaining { get; set; }
    [JsonPropertyName("lastUpdated")] public string LastUpdated { get; set; } = "";
}

public sealed class SimulateOptionsDto
{
    [JsonPropertyName("homeAdvantage")] public double? HomeAdvantage { get; set; }
    [JsonPropertyName("formWeight")] public double? FormWeight { get; set; }
    [JsonPropertyName("iterations")] public int? Iterations { get; set; }
}

public sealed class SimulateRequestDto
{
    [JsonPropertyName("event")] public OddsEventDto? Event { get; set; }
    [JsonPropertyName("options")] public SimulateOptionsDto? Options { get; set; }
}

public sealed class CustomSimulationRequestDto
{
    [JsonPropertyName("homeTeam")] public string? HomeTeam { get; set; }
    [JsonPropertyName("awayTeam")] public string? AwayTeam { get; set; }
    [JsonPropertyName("sportType")] public string? SportType { get; set; }
    [JsonPropertyName("homeOdds")] public double? HomeOdds { get; set; }
    [JsonPropertyName("awayOdds")] public double? AwayOdds { get; set; }
    [JsonPropertyName("drawOdds")] public double? DrawOdds { get; set; }
    [JsonPropertyName("homeAdvantage")] public double? HomeAdvantage { get; set; }
    [JsonPropertyName("iterations")] public int? Iterations { get; set; }
}

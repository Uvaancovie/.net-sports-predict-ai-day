namespace SportsPredictor.Api.Services;

public sealed class OddsApiOptions
{
    public string Key { get; set; } = "";
    public string BaseUrl { get; set; } = "https://api.the-odds-api.com/v4";
    public string DefaultRegions { get; set; } = "uk,us";
    public string DefaultMarkets { get; set; } = "h2h";
}

public sealed class OddsCacheOptions
{
    public int MaxStaleSeconds { get; set; } = 900;
    public int RefreshDebounceSeconds { get; set; } = 120;
    public int MinQuotaFloor { get; set; } = 15;
    public int SportsTtlMinutes { get; set; } = 60;
    public string DiskCachePath { get; set; } = "cache";
    public bool EnableBackgroundWorker { get; set; }
}

public sealed class JwtOptions
{
    public string Secret { get; set; } = "";
    public string Issuer { get; set; } = "SportsGroundBookingApi";
    public string Audience { get; set; } = "SportsGroundBookingApiUsers";
}

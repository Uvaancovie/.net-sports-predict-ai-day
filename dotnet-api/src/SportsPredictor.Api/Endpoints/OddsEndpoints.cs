using Microsoft.Extensions.Options;
using SportsPredictor.Api.Services;

namespace SportsPredictor.Api.Endpoints;

public static class OddsEndpoints
{
    public static IEndpointRouteBuilder MapOddsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/odds");

        group.MapGet("/sports", async (OddsProxyService odds) =>
        {
            var result = await odds.GetSportsAsync();
            return Results.Json(new
            {
                sports = result.Data,
                quota = odds.GetQuota(result.IsCached, result.TtlRemaining),
            });
        });

        group.MapGet("/events", async (
            string? sport,
            string? regions,
            string? markets,
            OddsProxyService odds,
            IOptions<OddsApiOptions> apiOptions) =>
        {
            var sportKey = string.IsNullOrWhiteSpace(sport) ? "upcoming" : sport;
            var regionList = string.IsNullOrWhiteSpace(regions) ? apiOptions.Value.DefaultRegions : regions;
            var marketList = string.IsNullOrWhiteSpace(markets) ? apiOptions.Value.DefaultMarkets : markets;

            var result = await odds.GetEventsAsync(sportKey, regionList, marketList);
            var quota = odds.GetQuota(result.IsCached, result.TtlRemaining);

            if (result.FallbackNotice is null)
            {
                return Results.Json(new { events = result.Data, sportKey, quota });
            }

            return Results.Json(new
            {
                events = result.Data,
                sportKey,
                quota,
                fallbackNotice = result.FallbackNotice,
            });
        });

        group.MapGet("/quota", (OddsProxyService odds) => Results.Json(odds.GetQuota(false, null)));

        group.MapPost("/cache/clear", (OddsProxyService odds) =>
        {
            odds.ClearCache();
            return Results.Json(new { success = true, message = "Odds API cache cleared" });
        });

        return app;
    }
}

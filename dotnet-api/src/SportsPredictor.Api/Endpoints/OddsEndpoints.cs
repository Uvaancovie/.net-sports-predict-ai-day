using System.Text.Json;
using Microsoft.Extensions.Options;
using SportsPredictor.Api.Models;
using SportsPredictor.Api.Services;

namespace SportsPredictor.Api.Endpoints;

public static class OddsEndpoints
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true,
    };

    private static object EnrichEvents(JsonElement data)
    {
        if (data.ValueKind != JsonValueKind.Array) return data;

        try
        {
            var events = data.Deserialize<List<OddsEventDto>>(JsonOptions);
            if (events is null) return data;

            foreach (var evt in events)
            {
                evt.H2H = H2HService.Build(evt.HomeTeam, evt.AwayTeam, evt.SportTitle);
            }

            return events;
        }
        catch
        {
            return data;
        }
    }

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
            var events = EnrichEvents(result.Data);

            if (result.FallbackNotice is null)
            {
                return Results.Json(new { events, sportKey, quota });
            }

            return Results.Json(new
            {
                events,
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

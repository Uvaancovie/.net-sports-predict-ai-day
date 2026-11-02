using SportsPredictor.Api.Models;
using SportsPredictor.Api.Services;

namespace SportsPredictor.Api.Endpoints;

public static class PredictionEndpoints
{
    public static IEndpointRouteBuilder MapPredictionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/predict/simulate", (SimulateRequestDto request, PredictionEngine engine) =>
        {
            var evt = request.Event;
            if (evt is null || string.IsNullOrWhiteSpace(evt.HomeTeam) || string.IsNullOrWhiteSpace(evt.AwayTeam))
            {
                return Results.Json(
                    new { success = false, message = "Valid event with home_team and away_team required" },
                    statusCode: StatusCodes.Status400BadRequest);
            }

            var prediction = engine.Analyze(evt, request.Options);
            return Results.Json(new { success = true, prediction });
        });

        app.MapPost("/api/predict/custom", (CustomSimulationRequestDto request, PredictionEngine engine) =>
        {
            if (string.IsNullOrWhiteSpace(request.HomeTeam) ||
                string.IsNullOrWhiteSpace(request.AwayTeam) ||
                request.HomeOdds is null or <= 0 ||
                request.AwayOdds is null or <= 0)
            {
                return Results.Json(
                    new { success = false, message = "homeTeam, awayTeam, homeOdds, and awayOdds are required" },
                    statusCode: StatusCodes.Status400BadRequest);
            }

            var outcomes = new List<OddsOutcomeDto>
            {
                new() { Name = request.HomeTeam!, Price = request.HomeOdds!.Value },
                new() { Name = request.AwayTeam!, Price = request.AwayOdds!.Value },
            };

            if (request.DrawOdds is > 0)
            {
                outcomes.Add(new OddsOutcomeDto { Name = "Draw", Price = request.DrawOdds.Value });
            }

            var syntheticEvent = new OddsEventDto
            {
                Id = $"custom-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                SportKey = "custom",
                SportTitle = string.IsNullOrWhiteSpace(request.SportType) ? "Custom Match" : request.SportType!,
                CommenceTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                HomeTeam = request.HomeTeam!,
                AwayTeam = request.AwayTeam!,
                Bookmakers = new List<OddsBookmakerDto>
                {
                    new()
                    {
                        Key = "consensus",
                        Title = "Custom Line",
                        LastUpdate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        Markets = new List<OddsMarketDto>
                        {
                            new() { Key = "h2h", Outcomes = outcomes },
                        },
                    },
                },
            };

            var prediction = engine.Analyze(syntheticEvent, new SimulateOptionsDto
            {
                HomeAdvantage = request.HomeAdvantage ?? 4,
                Iterations = request.Iterations is > 0 ? request.Iterations : 10000,
            });

            return Results.Json(new { success = true, prediction });
        });

        return app;
    }
}

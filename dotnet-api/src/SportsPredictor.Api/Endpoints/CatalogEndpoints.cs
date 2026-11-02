using SportsPredictor.Api.Models;
using SportsPredictor.Api.Services;

namespace SportsPredictor.Api.Endpoints;

public static class CatalogEndpoints
{
    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        var v1 = app.MapGroup("/api/v1");

        v1.MapGet("/grounds", (InMemoryStore store) =>
            EndpointHelpers.Ok(store.GetActiveGrounds()));

        v1.MapGet("/grounds/{id:int}", (int id, InMemoryStore store) =>
        {
            var ground = store.GetGround(id);
            return ground is null
                ? EndpointHelpers.Fail(StatusCodes.Status404NotFound, "Ground not found")
                : EndpointHelpers.Ok(ground);
        });

        v1.MapGet("/slots", (InMemoryStore store) =>
            EndpointHelpers.Ok(store.GetSlots()));

        v1.MapGet("/slots/ground/{groundId:int}", (int groundId, InMemoryStore store) =>
            EndpointHelpers.Ok(store.GetSlotsByGround(groundId)));

        v1.MapGet("/addons", (string? sportType, InMemoryStore store) =>
            EndpointHelpers.Ok(store.GetActiveAddons(sportType)));

        v1.MapPost("/addons", (CreateAddonRequest request, InMemoryStore store) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.AddonType) ||
                string.IsNullOrWhiteSpace(request.SportType))
            {
                return EndpointHelpers.Fail(
                    StatusCodes.Status400BadRequest,
                    "name, addonType, and sportType are required");
            }

            var addon = store.AddAddon(request);
            return Results.Json(new { success = true, message = "Addon created", data = addon });
        }).RequireAuthorization(policy => policy.RequireRole(EndpointHelpers.AdminRole));

        return app;
    }
}

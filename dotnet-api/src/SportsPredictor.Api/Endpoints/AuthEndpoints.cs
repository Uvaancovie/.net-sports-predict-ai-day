using System.Security.Claims;
using SportsPredictor.Api.Models;
using SportsPredictor.Api.Services;

namespace SportsPredictor.Api.Endpoints;

internal static class EndpointHelpers
{
    public const string AdminRole = "Admin";

    public static int? UserId(ClaimsPrincipal user) =>
        int.TryParse(user.FindFirst("nameid")?.Value, out var id) ? id : null;

    public static bool IsAdmin(ClaimsPrincipal user) =>
        string.Equals(user.FindFirst("role")?.Value, AdminRole, StringComparison.OrdinalIgnoreCase);

    public static IResult Unauthorized() => Results.Json(
        new { success = false, message = "Unauthorized" },
        statusCode: StatusCodes.Status401Unauthorized);

    public static IResult Fail(int statusCode, string message) =>
        Results.Json(new { success = false, message }, statusCode: statusCode);

    public static IResult Ok(object data) =>
        Results.Json(new { success = true, data });
}

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth");

        group.MapPost("/register", (RegisterRequest request, InMemoryStore store, TokenService tokens) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
            {
                return EndpointHelpers.Fail(StatusCodes.Status400BadRequest, "Missing required fields");
            }

            var (ok, error, user) = store.Register(request);
            if (!ok || user is null)
            {
                return EndpointHelpers.Fail(StatusCodes.Status400BadRequest, error ?? "Registration failed");
            }

            var token = tokens.GenerateToken(user);

            return Results.Json(new
            {
                success = true,
                message = "registration successful",
                data = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    phone = user.Phone,
                    role = user.Role,
                    token,
                },
            });
        });

        group.MapPost("/login", (LoginRequest request, InMemoryStore store, TokenService tokens) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return EndpointHelpers.Fail(StatusCodes.Status400BadRequest, "Email and password are required");
            }

            var user = store.FindUserByEmail(request.Email);
            if (user is null || !store.VerifyPassword(user, request.Password))
            {
                return EndpointHelpers.Fail(StatusCodes.Status401Unauthorized, "Invalid email or password");
            }

            var token = tokens.GenerateToken(user);

            return Results.Json(new
            {
                success = true,
                message = "login successful",
                data = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    phone = user.Phone,
                    role = user.Role,
                    token,
                },
            });
        });

        return app;
    }
}

using SportsPredictor.Api.Models;
using SportsPredictor.Api.Services;

namespace SportsPredictor.Api.Endpoints;

public static class BookingEndpoints
{
    private static object ToDetail(Booking booking, InMemoryStore store)
    {
        var slot = store.GetSlots().FirstOrDefault(s => s.Id == booking.SlotId);
        var ground = store.GetGround(booking.GroundId);

        return new
        {
            id = booking.Id,
            groundName = ground?.Name ?? "Unknown Ground",
            slotType = booking.SlotType,
            bookingDate = booking.BookingDate,
            startTime = slot?.StartTime,
            endTime = slot?.EndTime,
            baseAmount = booking.BaseAmount,
            addonAmount = booking.AddonAmount,
            totalAmount = booking.TotalAmount,
            status = booking.Status,
            paymentStatus = booking.PaymentStatus,
            addons = booking.BookingAddons.Select(a => new { name = a.AddonName, price = a.TotalPrice }),
            payment = booking.Payment is null
                ? null
                : new
                {
                    amount = booking.Payment.Amount,
                    status = booking.Payment.Status,
                    paidAt = booking.Payment.PaidAt,
                    reference = booking.Payment.PaymentReference,
                },
        };
    }

    private static object ToSummary(Booking booking, InMemoryStore store)
    {
        var ground = store.GetGround(booking.GroundId);
        return new
        {
            bookingId = booking.Id,
            groundName = ground?.Name ?? "Unknown Ground",
            slotType = booking.SlotType,
            bookingDate = booking.BookingDate,
            status = booking.Status,
            paymentStatus = booking.PaymentStatus,
            totalAmount = booking.TotalAmount,
        };
    }

    public static IEndpointRouteBuilder MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/booking").RequireAuthorization();

        group.MapGet("/my", (System.Security.Claims.ClaimsPrincipal user, InMemoryStore store) =>
        {
            var userId = EndpointHelpers.UserId(user);
            if (userId is null) return EndpointHelpers.Unauthorized();

            var bookings = store.GetBookingsForUser(userId.Value)
                .OrderByDescending(b => b.Id)
                .Select(b => ToDetail(b, store));

            return EndpointHelpers.Ok(bookings);
        });

        group.MapGet("/my-bookings", (System.Security.Claims.ClaimsPrincipal user, InMemoryStore store) =>
        {
            var userId = EndpointHelpers.UserId(user);
            if (userId is null) return EndpointHelpers.Unauthorized();

            var bookings = store.GetBookingsForUser(userId.Value)
                .OrderByDescending(b => b.Id)
                .Select(b => ToSummary(b, store));

            return EndpointHelpers.Ok(bookings);
        });

        group.MapGet("/availability", (int groundId, string? date, InMemoryStore store) =>
        {
            if (store.GetGround(groundId) is null)
            {
                return EndpointHelpers.Fail(StatusCodes.Status404NotFound, "Ground not found");
            }

            var bookingDate = date ?? DateTime.UtcNow.ToString("yyyy-MM-dd");
            return Results.Json(new
            {
                success = true,
                date = bookingDate,
                data = store.GetAvailability(groundId, bookingDate),
            });
        });

        group.MapGet("/{id:int}", (int id, System.Security.Claims.ClaimsPrincipal user, InMemoryStore store) =>
        {
            var userId = EndpointHelpers.UserId(user);
            if (userId is null) return EndpointHelpers.Unauthorized();

            var booking = store.GetBooking(id);
            if (booking is null)
            {
                return EndpointHelpers.Fail(StatusCodes.Status404NotFound, "Booking not found");
            }

            if (booking.UserId != userId.Value && !EndpointHelpers.IsAdmin(user))
            {
                return EndpointHelpers.Fail(StatusCodes.Status403Forbidden, "Forbidden");
            }

            return EndpointHelpers.Ok(ToDetail(booking, store));
        });

        group.MapPost("", (CreateBookingRequest request, System.Security.Claims.ClaimsPrincipal user, InMemoryStore store) =>
        {
            var userId = EndpointHelpers.UserId(user);
            if (userId is null) return EndpointHelpers.Unauthorized();

            var (ok, error, booking) = store.CreateBooking(userId.Value, request);
            if (!ok || booking is null)
            {
                return EndpointHelpers.Fail(StatusCodes.Status400BadRequest, error ?? "Booking failed");
            }

            return EndpointHelpers.Ok(ToDetail(booking, store));
        });

        group.MapDelete("/{id:int}", (int id, System.Security.Claims.ClaimsPrincipal user, InMemoryStore store) =>
        {
            var userId = EndpointHelpers.UserId(user);
            if (userId is null) return EndpointHelpers.Unauthorized();

            var (ok, error, _) = store.CancelBooking(userId.Value, id, EndpointHelpers.IsAdmin(user));
            if (!ok)
            {
                var status = error == "Booking not found"
                    ? StatusCodes.Status404NotFound
                    : error!.StartsWith("Forbidden", StringComparison.OrdinalIgnoreCase)
                        ? StatusCodes.Status403Forbidden
                        : StatusCodes.Status400BadRequest;
                return EndpointHelpers.Fail(status, error!);
            }

            return EndpointHelpers.Ok(new { message = "Booking cancelled successfully" });
        });

        return app;
    }
}

public static class PaymentEndpoints
{
    public static IEndpointRouteBuilder MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/v1/payments/pay/{bookingId:int}",
            (int bookingId, System.Security.Claims.ClaimsPrincipal user, InMemoryStore store) =>
            {
                var userId = EndpointHelpers.UserId(user);
                if (userId is null) return EndpointHelpers.Unauthorized();

                var (ok, error, payment, _) = store.PayBooking(userId.Value, bookingId, EndpointHelpers.IsAdmin(user));
                if (!ok || payment is null)
                {
                    var status = error == "Booking not found"
                        ? StatusCodes.Status404NotFound
                        : error!.StartsWith("Forbidden", StringComparison.OrdinalIgnoreCase)
                            ? StatusCodes.Status403Forbidden
                            : StatusCodes.Status400BadRequest;
                    return EndpointHelpers.Fail(status, error!);
                }

                return Results.Json(new
                {
                    success = true,
                    data = new
                    {
                        bookingId,
                        status = "Confirmed",
                        paymentStatus = "Paid",
                        transactionId = payment.PaymentReference,
                        paidAt = payment.PaidAt,
                    },
                });
            }).RequireAuthorization();

        return app;
    }
}

public static class FeedbackEndpoints
{
    public static IEndpointRouteBuilder MapFeedbackEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/feedback");

        group.MapPost("", (FeedbackRequest request, System.Security.Claims.ClaimsPrincipal user, InMemoryStore store) =>
        {
            var userId = EndpointHelpers.UserId(user);
            if (userId is null) return EndpointHelpers.Unauthorized();

            var (ok, error, _) = store.AddFeedback(userId.Value, request);
            if (!ok)
            {
                var status = error == "Booking not found"
                    ? StatusCodes.Status404NotFound
                    : error!.StartsWith("Forbidden", StringComparison.OrdinalIgnoreCase)
                        ? StatusCodes.Status403Forbidden
                        : StatusCodes.Status400BadRequest;
                return EndpointHelpers.Fail(status, error!);
            }

            return EndpointHelpers.Ok(new { message = "Feedback submitted successfully" });
        }).RequireAuthorization();

        group.MapGet("/ground/{groundId:int}", (int groundId, InMemoryStore store) =>
        {
            var reviews = store.GetFeedbackForGround(groundId);
            var average = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0;

            return EndpointHelpers.Ok(new
            {
                groundId,
                averageRating = average,
                totalReviews = reviews.Count,
                reviews,
            });
        });

        return app;
    }
}

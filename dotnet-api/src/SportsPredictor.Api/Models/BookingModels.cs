namespace SportsPredictor.Api.Models;

public sealed class ApiEnvelope<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }

    public static ApiEnvelope<T> Ok(T data) => new() { Success = true, Data = data };
    public static ApiEnvelope<object> Fail(string message) => new() { Success = false, Message = message, Data = null };
}

public sealed class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "User";
    public bool IsVerified { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
}

public sealed class Ground
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string SportType { get; set; } = "";
    public string Description { get; set; } = "";
    public string Address { get; set; } = "";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
}

public sealed class Slot
{
    public int Id { get; set; }
    public int GroundId { get; set; }
    public string SlotType { get; set; } = "Day";
    public string StartTime { get; set; } = "";
    public string EndTime { get; set; } = "";
    public double BasePrice { get; set; }
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
}

public sealed class Addon
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string AddonType { get; set; } = "";
    public string SportType { get; set; } = "";
    public double Price { get; set; }
    public bool IsComplimentary { get; set; }
    public bool IsActive { get; set; } = true;
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
}

public sealed class BookingAddonItem
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int AddonId { get; set; }
    public string AddonName { get; set; } = "";
    public double UnitPrice { get; set; }
    public double TotalPrice { get; set; }
}

public sealed class PaymentRecord
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public string PaymentReference { get; set; } = "";
    public double Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public string? PaidAt { get; set; }
    public string CreatedAt { get; set; } = "";
}

public sealed class Feedback
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int GroundId { get; set; }
    public int BookingId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    public bool IsVisible { get; set; } = true;
    public string CreatedAt { get; set; } = "";
}

public sealed class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int GroundId { get; set; }
    public int SlotId { get; set; }
    public string BookingDate { get; set; } = "";
    public string SlotType { get; set; } = "Day";
    public string Status { get; set; } = "PendingPayment";
    public double BaseAmount { get; set; }
    public double AddonAmount { get; set; }
    public double TotalAmount { get; set; }
    public string PaymentStatus { get; set; } = "Pending";
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
    public List<BookingAddonItem> BookingAddons { get; set; } = new();
    public PaymentRecord? Payment { get; set; }
}

public sealed class FeedbackView
{
    public string UserName { get; set; } = "Anonymous";
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    public string SubmittedAt { get; set; } = "";
}

public sealed class RegisterRequest
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Password { get; set; }
}

public sealed class LoginRequest
{
    public string? Email { get; set; }
    public string? Password { get; set; }
}

public sealed class CreateBookingRequest
{
    public int GroundId { get; set; }
    public int SlotId { get; set; }
    public string? BookingDate { get; set; }
    public List<int>? AddonIds { get; set; }
}

public sealed class CreateAddonRequest
{
    public string? Name { get; set; }
    public string? AddonType { get; set; }
    public string? SportType { get; set; }
    public double Price { get; set; }
    public bool IsComplimentary { get; set; }
}

public sealed class FeedbackRequest
{
    public int BookingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

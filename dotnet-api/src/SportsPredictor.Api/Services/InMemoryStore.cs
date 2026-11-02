using SportsPredictor.Api.Models;

namespace SportsPredictor.Api.Services;

public sealed class InMemoryStore
{
    private readonly object _gate = new();

    private int _nextUserId = 3;
    private int _nextAddonId = 7;
    private int _nextBookingId = 4;
    private int _nextPaymentId = 4;
    private int _nextFeedbackId = 3;
    private int _nextBookingAddonId = 5;

    private readonly List<User> _users = new();
    private readonly List<Ground> _grounds = new();
    private readonly List<Slot> _slots = new();
    private readonly List<Addon> _addons = new();
    private readonly List<Booking> _bookings = new();
    private readonly List<PaymentRecord> _payments = new();
    private readonly List<Feedback> _feedbacks = new();

    public InMemoryStore()
    {
        Seed();
    }

    private static string Iso(DateTime dt) =>
        DateTime.SpecifyKind(dt, DateTimeKind.Utc).ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

    private static string NowIso() => Iso(DateTime.UtcNow.AddHours(2)); // SAST-friendly demo clock

    private void Seed()
    {
        _users.AddRange(new[]
        {
            new User
            {
                Id = 1, FullName = "Admin User", Email = "admin@cricketbooking.com", Phone = "+1234567890",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123", 10), Role = "Admin",
                IsVerified = true, IsActive = true,
                CreatedAt = "2026-01-01T00:00:00.000Z", UpdatedAt = "2026-01-01T00:00:00.000Z",
            },
            new User
            {
                Id = 2, FullName = "Rohit Sharma", Email = "user@cricketbooking.com", Phone = "+1987654321",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123", 10), Role = "User",
                IsVerified = true, IsActive = true,
                CreatedAt = "2026-01-05T00:00:00.000Z", UpdatedAt = "2026-01-05T00:00:00.000Z",
            },
        });

        _grounds.AddRange(new[]
        {
            new Ground { Id = 1, Name = "Lord's Cricket Ground", SportType = "Cricket", Description = "The Home of Cricket with world-class turf pitch, full pavilion, and electronic scoring.", Address = "St John's Wood Rd, London NW8 8QN, UK", Latitude = 51.5298, Longitude = -0.1724, IsActive = true, CreatedAt = "2026-01-01T00:00:00.000Z", UpdatedAt = "2026-01-01T00:00:00.000Z" },
            new Ground { Id = 2, Name = "Eden Gardens Stadium", SportType = "Cricket", Description = "Iconic cricket venue featuring illuminated floodlights, practice turf nets, and media box.", Address = "B.B.D. Bagh, Kolkata, West Bengal 700021", Latitude = 22.5646, Longitude = 88.3433, IsActive = true, CreatedAt = "2026-01-02T00:00:00.000Z", UpdatedAt = "2026-01-02T00:00:00.000Z" },
            new Ground { Id = 3, Name = "Melbourne Cricket Ground", SportType = "Multi-Sport", Description = "Premier multi-sport amphitheater ideal for high-intensity night matches and athletic meets.", Address = "Brunton Ave, Richmond VIC 3002, Australia", Latitude = -37.82, Longitude = 144.9834, IsActive = true, CreatedAt = "2026-01-03T00:00:00.000Z", UpdatedAt = "2026-01-03T00:00:00.000Z" },
            new Ground { Id = 4, Name = "The Oval Arena", SportType = "Cricket", Description = "Historic sports grounds with fast grass wicket and member clubhouse facilities.", Address = "Kennington Oval, London SE11 5SS, UK", Latitude = 51.4838, Longitude = -0.115, IsActive = true, CreatedAt = "2026-01-04T00:00:00.000Z", UpdatedAt = "2026-01-04T00:00:00.000Z" },
            new Ground { Id = 5, Name = "Wankhede Sports Complex", SportType = "Cricket", Description = "Coastal ground known for electrifying atmosphere, red soil wickets, and player lounges.", Address = "Vinoo Mankad Rd, Churchgate, Mumbai 400020", Latitude = 18.9389, Longitude = 72.8258, IsActive = true, CreatedAt = "2026-01-05T00:00:00.000Z", UpdatedAt = "2026-01-05T00:00:00.000Z" },
        });

        var now = NowIso();
        _slots.AddRange(new[]
        {
            NewSlot(1, 1, "Day", "09:00:00", "13:00:00", 250, now),
            NewSlot(2, 1, "Night", "18:00:00", "22:00:00", 350, now),
            NewSlot(3, 1, "FullDay", "09:00:00", "22:00:00", 550, now),
            NewSlot(4, 2, "Day", "08:30:00", "13:30:00", 200, now),
            NewSlot(5, 2, "Night", "17:30:00", "22:30:00", 300, now),
            NewSlot(6, 3, "Day", "09:00:00", "14:00:00", 280, now),
            NewSlot(7, 3, "Night", "18:00:00", "23:00:00", 400, now),
            NewSlot(8, 4, "Day", "09:00:00", "13:00:00", 220, now),
            NewSlot(9, 4, "Night", "18:00:00", "22:00:00", 320, now),
            NewSlot(10, 5, "Day", "08:00:00", "12:00:00", 240, now),
            NewSlot(11, 5, "Night", "17:00:00", "21:00:00", 360, now),
        });

        _addons.AddRange(new[]
        {
            NewAddon(1, "Stadium Floodlights", "Lighting", "Cricket", 60, false, now),
            NewAddon(2, "Certified Umpire & Live Scorer", "Staff", "Cricket", 50, false, now),
            NewAddon(3, "Premium Leather Balls & Kit", "Equipment", "Cricket", 40, false, now),
            NewAddon(4, "HD Video Recording & Highlight Reel", "Media", "Multi-Sport", 75, false, now),
            NewAddon(5, "Refreshment & Electrolyte Cooler", "Food", "Multi-Sport", 30, false, now),
            NewAddon(6, "First Aid & Physio Kit", "Medical", "Multi-Sport", 0, true, now),
        });

        _payments.AddRange(new[]
        {
            new PaymentRecord { Id = 1, BookingId = 1, PaymentReference = "c4e58b19-f55a-4e44-8843-c0202931a7f1", Amount = 310, Status = "Paid", PaidAt = "2026-05-10T14:30:00.000Z", CreatedAt = "2026-05-10T14:30:00.000Z" },
            new PaymentRecord { Id = 2, BookingId = 2, PaymentReference = "7a98b241-d3ef-4d7a-8d12-984bb304f51e", Amount = 400, Status = "Paid", PaidAt = "2026-05-12T10:15:00.000Z", CreatedAt = "2026-05-12T10:15:00.000Z" },
        });

        _bookings.AddRange(new[]
        {
            new Booking
            {
                Id = 1, UserId = 2, GroundId = 1, SlotId = 1, BookingDate = "2026-05-15", SlotType = "Day",
                Status = "Confirmed", BaseAmount = 250, AddonAmount = 60, TotalAmount = 310, PaymentStatus = "Paid",
                CreatedAt = "2026-05-10T14:00:00.000Z", UpdatedAt = "2026-05-10T14:30:00.000Z",
                BookingAddons = new List<BookingAddonItem>
                {
                    new() { Id = 1, BookingId = 1, AddonId = 1, AddonName = "Stadium Floodlights", UnitPrice = 60, TotalPrice = 60 },
                },
                Payment = _payments[0],
            },
            new Booking
            {
                Id = 2, UserId = 2, GroundId = 2, SlotId = 5, BookingDate = "2026-05-20", SlotType = "Night",
                Status = "Confirmed", BaseAmount = 300, AddonAmount = 100, TotalAmount = 400, PaymentStatus = "Paid",
                CreatedAt = "2026-05-12T10:00:00.000Z", UpdatedAt = "2026-05-12T10:15:00.000Z",
                BookingAddons = new List<BookingAddonItem>
                {
                    new() { Id = 2, BookingId = 2, AddonId = 1, AddonName = "Stadium Floodlights", UnitPrice = 60, TotalPrice = 60 },
                    new() { Id = 3, BookingId = 2, AddonId = 3, AddonName = "Premium Leather Balls & Kit", UnitPrice = 40, TotalPrice = 40 },
                },
                Payment = _payments[1],
            },
        });

        _feedbacks.Add(new Feedback
        {
            Id = 1, UserId = 2, GroundId = 1, BookingId = 1, Rating = 5,
            Comment = "Spectacular pitch conditions and historic atmosphere. Will definitely book again!",
            IsVisible = true, CreatedAt = "2026-05-16T12:00:00.000Z",
        });
    }

    private static Slot NewSlot(int id, int groundId, string type, string start, string end, double price, string now) => new()
    {
        Id = id, GroundId = groundId, SlotType = type, StartTime = start, EndTime = end,
        BasePrice = price, IsActive = true, CreatedAt = now, UpdatedAt = now,
    };

    private static Addon NewAddon(int id, string name, string addonType, string sportType, double price, bool complimentary, string now) => new()
    {
        Id = id, Name = name, AddonType = addonType, SportType = sportType, Price = price,
        IsComplimentary = complimentary, IsActive = true, CreatedAt = now, UpdatedAt = now,
    };

    // ---------- Users ----------

    public User? FindUserByEmail(string email)
    {
        lock (_gate)
        {
            return _users.FirstOrDefault(u => string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase));
        }
    }

    public User? FindUserById(int id)
    {
        lock (_gate)
        {
            return _users.FirstOrDefault(u => u.Id == id);
        }
    }

    public (bool Ok, string? Error, User? User) Register(RegisterRequest req)
    {
        lock (_gate)
        {
            var normalized = req.Email!.Trim().ToLowerInvariant();
            if (_users.Any(u => string.Equals(u.Email, normalized, StringComparison.OrdinalIgnoreCase)))
            {
                return (false, "Email already registered", null);
            }

            var user = new User
            {
                Id = _nextUserId++,
                FullName = req.FullName!.Trim(),
                Email = normalized,
                Phone = req.Phone ?? "",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password!, 10),
                Role = "User",
                IsVerified = true,
                IsActive = true,
                CreatedAt = NowIso(),
                UpdatedAt = NowIso(),
            };
            _users.Add(user);
            return (true, null, user);
        }
    }

    public bool VerifyPassword(User user, string password) => BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

    // ---------- Catalog ----------

    public List<Ground> GetActiveGrounds()
    {
        lock (_gate) return _grounds.Where(g => g.IsActive).ToList();
    }

    public Ground? GetGround(int id)
    {
        lock (_gate) return _grounds.FirstOrDefault(g => g.Id == id);
    }

    public List<Slot> GetSlots()
    {
        lock (_gate) return _slots.ToList();
    }

    public List<Slot> GetSlotsByGround(int groundId)
    {
        lock (_gate) return _slots.Where(s => s.GroundId == groundId && s.IsActive).ToList();
    }

    public List<Addon> GetActiveAddons(string? sportType)
    {
        lock (_gate)
        {
            if (string.IsNullOrWhiteSpace(sportType))
            {
                return _addons.Where(a => a.IsActive).ToList();
            }

            return _addons.Where(a => a.IsActive &&
                (string.Equals(a.SportType, sportType, StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(a.SportType, "Multi-Sport", StringComparison.OrdinalIgnoreCase)))
                .ToList();
        }
    }

    public Addon AddAddon(CreateAddonRequest req)
    {
        lock (_gate)
        {
            var addon = NewAddon(_nextAddonId++, req.Name!, req.AddonType!, req.SportType!, req.Price, req.IsComplimentary, NowIso());
            _addons.Add(addon);
            return addon;
        }
    }

    // ---------- Bookings ----------

    public List<Booking> GetBookingsForUser(int userId)
    {
        lock (_gate) return _bookings.Where(b => b.UserId == userId).ToList();
    }

    public Booking? GetBooking(int id)
    {
        lock (_gate) return _bookings.FirstOrDefault(b => b.Id == id);
    }

    public List<object> GetAvailability(int groundId, string? date)
    {
        lock (_gate)
        {
            date ??= "";
            var groundSlots = _slots.Where(s => s.GroundId == groundId && s.IsActive).ToList();
            var existing = _bookings
                .Where(b => b.GroundId == groundId && b.BookingDate == date && b.Status != "Cancelled")
                .ToList();

            return groundSlots.Select(s => (object)new
            {
                slotId = s.Id,
                slotType = s.SlotType,
                startTime = s.StartTime,
                endTime = s.EndTime,
                basePrice = s.BasePrice,
                isAvailable = !existing.Any(b => b.SlotId == s.Id || b.SlotType == "FullDay" || s.SlotType == "FullDay"),
            }).ToList();
        }
    }

    private bool HasConflictLocked(int groundId, string date, int slotId, string slotType)
    {
        return _bookings.Any(b =>
            b.GroundId == groundId &&
            b.BookingDate == date &&
            b.Status != "Cancelled" &&
            (b.SlotId == slotId || b.SlotType == "FullDay" || slotType == "FullDay"));
    }

    public (bool Ok, string? Error, Booking? Booking) CreateBooking(int userId, CreateBookingRequest req)
    {
        lock (_gate)
        {
            var ground = _grounds.FirstOrDefault(g => g.Id == req.GroundId && g.IsActive);
            if (ground is null) return (false, "Ground not found", null);

            var slot = _slots.FirstOrDefault(s => s.Id == req.SlotId && s.GroundId == req.GroundId && s.IsActive);
            if (slot is null) return (false, "Slot not found for this ground", null);

            if (string.IsNullOrWhiteSpace(req.BookingDate) || !DateOnly.TryParse(req.BookingDate, out _))
                return (false, "A valid bookingDate (YYYY-MM-DD) is required", null);

            if (HasConflictLocked(ground.Id, req.BookingDate, slot.Id, slot.SlotType))
                return (false, "Slot is already booked for the selected date", null);

            var bookingId = _nextBookingId++;
            var addonIds = req.AddonIds ?? new List<int>();
            var selectedAddons = _addons.Where(a => addonIds.Contains(a.Id) && a.IsActive).ToList();

            if (selectedAddons.Count != addonIds.Distinct().Count())
                return (false, "One or more addons are invalid", null);

            var items = new List<BookingAddonItem>();
            double addonAmount = 0;
            foreach (var addon in selectedAddons)
            {
                addonAmount += addon.Price;
                items.Add(new BookingAddonItem
                {
                    Id = _nextBookingAddonId++,
                    BookingId = bookingId,
                    AddonId = addon.Id,
                    AddonName = addon.Name,
                    UnitPrice = addon.Price,
                    TotalPrice = addon.Price,
                });
            }

            var booking = new Booking
            {
                Id = bookingId,
                UserId = userId,
                GroundId = ground.Id,
                SlotId = slot.Id,
                BookingDate = req.BookingDate!,
                SlotType = slot.SlotType,
                Status = "PendingPayment",
                BaseAmount = slot.BasePrice,
                AddonAmount = addonAmount,
                TotalAmount = slot.BasePrice + addonAmount,
                PaymentStatus = "Pending",
                CreatedAt = NowIso(),
                UpdatedAt = NowIso(),
                BookingAddons = items,
            };

            _bookings.Add(booking);
            return (true, null, booking);
        }
    }

    public (bool Ok, string? Error, Booking? Booking) CancelBooking(int userId, int bookingId, bool isAdmin)
    {
        lock (_gate)
        {
            var booking = _bookings.FirstOrDefault(b => b.Id == bookingId);
            if (booking is null) return (false, "Booking not found", null);
            if (!isAdmin && booking.UserId != userId) return (false, "Forbidden. You can only cancel your own booking.", null);
            if (booking.Status == "Cancelled") return (false, "Booking is already cancelled", null);

            booking.Status = "Cancelled";
            booking.UpdatedAt = NowIso();
            return (true, null, booking);
        }
    }

    public (bool Ok, string? Error, PaymentRecord? Payment, Booking? Booking) PayBooking(int userId, int bookingId, bool isAdmin)
    {
        lock (_gate)
        {
            var booking = _bookings.FirstOrDefault(b => b.Id == bookingId);
            if (booking is null) return (false, "Booking not found", null, null);
            if (!isAdmin && booking.UserId != userId) return (false, "Forbidden. You can only pay for your own booking.", null, null);
            if (booking.Status == "Cancelled") return (false, "Cannot pay for a cancelled booking", null, null);
            if (booking.PaymentStatus == "Paid") return (false, "Booking is already paid", null, null);

            var payment = new PaymentRecord
            {
                Id = _nextPaymentId++,
                BookingId = booking.Id,
                PaymentReference = Guid.NewGuid().ToString(),
                Amount = booking.TotalAmount,
                Status = "Paid",
                PaidAt = NowIso(),
                CreatedAt = NowIso(),
            };

            _payments.Add(payment);
            booking.PaymentStatus = "Paid";
            booking.Status = "Confirmed";
            booking.Payment = payment;
            booking.UpdatedAt = NowIso();

            return (true, null, payment, booking);
        }
    }

    // ---------- Feedback ----------

    public (bool Ok, string? Error, Feedback? Feedback) AddFeedback(int userId, FeedbackRequest req)
    {
        lock (_gate)
        {
            var booking = _bookings.FirstOrDefault(b => b.Id == req.BookingId);
            if (booking is null) return (false, "Booking not found", null);
            if (booking.UserId != userId) return (false, "Forbidden. You can only review your own booking.", null);
            if (booking.Status != "Confirmed") return (false, "Only confirmed bookings can be reviewed", null);
            if (req.Rating < 1 || req.Rating > 5) return (false, "Rating must be between 1 and 5", null);
            if (req.Comment is { Length: > 500 }) return (false, "Comment must be 500 characters or fewer", null);
            if (_feedbacks.Any(f => f.BookingId == req.BookingId)) return (false, "Feedback already submitted for this booking", null);

            var feedback = new Feedback
            {
                Id = _nextFeedbackId++,
                UserId = userId,
                GroundId = booking.GroundId,
                BookingId = booking.Id,
                Rating = req.Rating,
                Comment = req.Comment ?? "",
                IsVisible = true,
                CreatedAt = NowIso(),
            };
            _feedbacks.Add(feedback);
            return (true, null, feedback);
        }
    }

    public List<FeedbackView> GetFeedbackForGround(int groundId)
    {
        lock (_gate)
        {
            var reviews = _feedbacks.Where(f => f.GroundId == groundId && f.IsVisible).ToList();
            return reviews.Select(f => new FeedbackView
            {
                UserName = _users.FirstOrDefault(u => u.Id == f.UserId)?.FullName ?? "Anonymous",
                Rating = f.Rating,
                Comment = f.Comment,
                SubmittedAt = f.CreatedAt,
            }).ToList();
        }
    }

    public string GetUserName(int userId)
    {
        lock (_gate) return _users.FirstOrDefault(u => u.Id == userId)?.FullName ?? "Anonymous";
    }
}

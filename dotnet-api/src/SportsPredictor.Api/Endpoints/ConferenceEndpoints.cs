namespace SportsPredictor.Api.Endpoints;

public static class ConferenceEndpoints
{
    public static IEndpointRouteBuilder MapConferenceEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/conference/metadata", () => Results.Json(new
        {
            @event = "Data & AI Community Day Durban: Encore / .NET Conf Community Edition South Africa",
            date = "November 21, 2026",
            speaker = "Uvaan",
            sessionTitle = "Developing A .NET Sports Predictor",
            duration = "50 Minutes",
            venue = "Richfield College Umhlanga Campus, Centenary Boulevard, Park Square, Umhlanga, Durban",
            schedule = "08:00 AM - 18:00",
            slides = new object[]
            {
                new
                {
                    id = 1,
                    title = "Developing A .NET Sports Predictor",
                    subtitle = "Transforming Live Odds Market Signals into Actionable Match Predictions with C# & Modern Math",
                    points = new[]
                    {
                        "Welcome to Data & AI Community Day Durban: Encore",
                        "Bridging Data Engineering, Live APIs, and Machine Learning in .NET",
                        "Why sports prediction is an ideal proving ground for real-time data pipelines",
                        "Session duration: 50 minutes of practical architecture and live code",
                    },
                },
                new
                {
                    id = 2,
                    title = "The Data Source: The Odds API v4",
                    subtitle = "Real-time bookmaker odds from 40+ global sportsbooks",
                    points = new[]
                    {
                        "The Odds API architecture & JSON protocol",
                        "Tracking usage credits (x-requests-remaining, x-requests-used)",
                        "Supported markets: Head-to-Head (h2h / Moneyline), Spreads, Totals",
                        "Handling time zones, commence times, and live in-play updates",
                    },
                },
                new
                {
                    id = 3,
                    title = "The Math: Stripping Vigorish & Implied Probabilities",
                    subtitle = "How bookmakers profit and how we extract true fair probability",
                    points = new[]
                    {
                        "Raw implied probability: P_raw = 1 / DecimalOdds",
                        "Bookmaker overround / margin: Total = Sum(P_raw) > 100% (typically 104% - 110%)",
                        "Shin / Proportional normalization to isolate true underlying win probability",
                        "Expected Value (+EV) equation: EV = (TrueProb * OfferedOdds) - 1",
                    },
                },
                new
                {
                    id = 4,
                    title = "Simulation Engines: Poisson & Monte Carlo",
                    subtitle = "Generating probabilistic match outcomes and score distributions",
                    points = new[]
                    {
                        "Poisson distribution for low-scoring events (Football / Soccer, Hockey)",
                        "P(k; λ) = (λ^k * e^-λ) / k! for goal expectation",
                        "Running 10,000 Monte Carlo match simulations in parallel in C#",
                        "Extracting confidence intervals and standard deviation",
                    },
                },
                new
                {
                    id = 5,
                    title = ".NET 10 / C# 13 Architecture for Prediction Services",
                    subtitle = "High performance, resiliency, and clean architecture",
                    points = new[]
                    {
                        "IHttpClientFactory with Polly for exponential backoff & circuit breakers",
                        "MemoryCache / DistributedCache to prevent quota exhaustion",
                        "Background Worker Services (IHostedService) for periodic odds ingestion",
                        "ML.NET and ONNX runtime integration for feature-engineered predictive models",
                    },
                },
                new
                {
                    id = 6,
                    title = "Live Interactive Demo",
                    subtitle = "Running live predictions on stage at Park Square Umhlanga",
                    points = new[]
                    {
                        "Live fixture lookup across EPL, Cricket, NBA, Rugby",
                        "Real-time bookmaker odds comparison",
                        "Monte Carlo simulation visualization",
                        "Kelly Criterion capital allocation guidance",
                    },
                },
            },
        }));

        return app;
    }
}

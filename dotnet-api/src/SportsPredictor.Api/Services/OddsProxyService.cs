using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using SportsPredictor.Api.Models;

namespace SportsPredictor.Api.Services;

public sealed record ProxyResult(JsonElement Data, bool IsCached, int? TtlRemaining, string? FallbackNotice);

/// <summary>
/// Tiered credit-saver proxy for The Odds API v4.
/// L1 memory → L2 disk (survives restarts) → L3 seeded demo data → L4 live upstream.
/// Stale-while-revalidate, single-flight locks, refresh debounce and a quota circuit breaker
/// keep actual API credit consumption as close to zero as possible.
/// </summary>
public sealed class OddsProxyService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private sealed class MemEntry
    {
        public string Json { get; set; } = "";
        public DateTime StoredAtUtc { get; set; }
        public int FreshForSeconds { get; set; }
        public int MaxStaleSeconds { get; set; }
    }

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _memory;
    private readonly DiskCacheStore _disk;
    private readonly OddsApiOptions _api;
    private readonly OddsCacheOptions _cache;
    private readonly ILogger<OddsProxyService> _logger;

    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
    private readonly ConcurrentDictionary<string, byte> _knownKeys = new();
    private readonly ConcurrentDictionary<string, DateTime> _lastRefreshUtc = new();

    private readonly object _quotaGate = new();
    private QuotaState _quota;

    private readonly object _breakerGate = new();
    private DateTime? _backoffUntilUtc;
    private int _backoffLevel;

    public OddsProxyService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache memory,
        DiskCacheStore disk,
        IOptions<OddsApiOptions> api,
        IOptions<OddsCacheOptions> cache,
        ILogger<OddsProxyService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _memory = memory;
        _disk = disk;
        _api = api.Value;
        _cache = cache.Value;
        _logger = logger;
        _quota = _disk.LoadQuota();

        _logger.LogInformation(
            "Credit-saver cache online. L2 path ready, quota {Remaining}/{Used}, floor {Floor}, stale window {Stale}s",
            _quota.Remaining, _quota.Used, _cache.MinQuotaFloor, _cache.MaxStaleSeconds);
    }

    // ---------------------------------------------------------------- public API

    public async Task<ProxyResult> GetSportsAsync()
    {
        const string key = "sports-list";
        var freshFor = TimeSpan.FromMinutes(Math.Max(1, _cache.SportsTtlMinutes));
        var maxStale = TimeSpan.FromHours(24);

        return await GetViaSwrAsync(
            key,
            freshFor,
            maxStale,
            FetchSportsUpstreamAsync,
            isFreeCall: true,
            () => DemoData.SportsElement());
    }

    public async Task<ProxyResult> GetEventsAsync(string sport, string regions, string markets)
    {
        var key = $"odds-{sport}-{regions}-{markets}";
        var freshFor = TimeSpan.FromSeconds(Math.Max(30, _cache.MaxStaleSeconds));
        var maxStale = TimeSpan.FromSeconds(Math.Max(_cache.MaxStaleSeconds * 4, _cache.MaxStaleSeconds + 300));

        return await GetViaSwrAsync(
            key,
            freshFor,
            maxStale,
            ct => FetchEventsUpstreamAsync(sport, regions, markets, ct),
            isFreeCall: false,
            () => DemoData.EventsElement(sport));
    }

    public QuotaInfo GetQuota(bool isCached, int? ttlRemaining)
    {
        lock (_quotaGate)
        {
            return new QuotaInfo
            {
                Remaining = _quota.Remaining,
                Used = _quota.Used,
                LastCost = _quota.LastCost,
                IsCached = isCached,
                TtlRemaining = ttlRemaining,
                LastUpdated = _quota.LastUpdated,
            };
        }
    }

    public void ClearCache()
    {
        foreach (var key in _knownKeys.Keys)
        {
            _memory.Remove(MemKey(key));
        }
        _knownKeys.Clear();
        _disk.Clear();
        _lastRefreshUtc.Clear();
        _logger.LogInformation("Odds cache cleared (memory + disk). Quota telemetry retained.");
    }

    // ---------------------------------------------------------------- SWR pipeline

    private async Task<ProxyResult> GetViaSwrAsync(
        string key,
        TimeSpan freshFor,
        TimeSpan maxStale,
        Func<CancellationToken, Task<string>> fetch,
        bool isFreeCall,
        Func<JsonElement> fallback)
    {
        var entry = GetEntry(key);
        if (entry is not null)
        {
            var age = DateTime.UtcNow - entry.StoredAtUtc;

            if (age <= TimeSpan.FromSeconds(entry.FreshForSeconds))
            {
                return new ProxyResult(ToElement(entry.Json), true, TtlRemaining(entry), null);
            }

            if (age <= TimeSpan.FromSeconds(entry.MaxStaleSeconds))
            {
                ScheduleBackgroundRefresh(key, fetch);
                return new ProxyResult(ToElement(entry.Json), true, 0, null);
            }
        }

        // Cold key or data beyond the hard stale cap: allow one synchronous fetch.
        if (CanCallUpstream(isFreeCall))
        {
            try
            {
                var json = await FetchWithSingleFlightAsync(key, freshFor, maxStale, fetch);
                return new ProxyResult(ToElement(json), false, (int)freshFor.TotalSeconds, null);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Upstream fetch failed for {Key}; serving cache/demo data", key);
            }
        }
        else
        {
            _logger.LogInformation("Skipping upstream call for {Key}: quota floor or breaker active", key);
        }

        if (entry is not null)
        {
            return new ProxyResult(ToElement(entry.Json), true, 0, null);
        }

        return new ProxyResult(fallback(), true, null,
            "Demonstration data loaded (Odds API network call bypassed or rate limited)");
    }

    private void ScheduleBackgroundRefresh(string key, Func<CancellationToken, Task<string>> fetch)
    {
        if (!CanCallUpstream(isFreeCall: false)) return;

        var now = DateTime.UtcNow;
        var debounce = TimeSpan.FromSeconds(Math.Max(10, _cache.RefreshDebounceSeconds));

        if (_lastRefreshUtc.TryGetValue(key, out var last) && now - last < debounce) return;
        _lastRefreshUtc[key] = now;

        _ = Task.Run(async () =>
        {
            try
            {
                await FetchWithSingleFlightAsync(
                    key,
                    TimeSpan.FromSeconds(_cache.MaxStaleSeconds),
                    TimeSpan.FromSeconds(Math.Max(_cache.MaxStaleSeconds * 4, _cache.MaxStaleSeconds + 300)),
                    fetch);
                _logger.LogInformation("Background refresh completed for {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Background refresh failed for {Key}", key);
            }
        });
    }

    private async Task<string> FetchWithSingleFlightAsync(
        string key,
        TimeSpan freshFor,
        TimeSpan maxStale,
        Func<CancellationToken, Task<string>> fetch)
    {
        var gate = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync();
        try
        {
            // Another caller may have refreshed while we waited.
            var existing = GetEntry(key);
            if (existing is not null &&
                DateTime.UtcNow - existing.StoredAtUtc <= TimeSpan.FromSeconds(existing.FreshForSeconds))
            {
                return existing.Json;
            }

            var json = await fetch(CancellationToken.None);
            if (string.IsNullOrWhiteSpace(json))
            {
                throw new InvalidOperationException("Empty upstream payload");
            }

            Store(key, json, freshFor, maxStale);
            return json;
        }
        finally
        {
            gate.Release();
        }
    }

    // ---------------------------------------------------------------- cache plumbing

    private static string MemKey(string key) => $"odds:{key}";

    private MemEntry? GetEntry(string key)
    {
        if (_memory.TryGetValue(MemKey(key), out MemEntry? mem) && mem is not null)
        {
            return mem;
        }

        var disk = _disk.Load(key);
        if (disk is null) return null;

        var entry = new MemEntry
        {
            Json = disk.Json,
            StoredAtUtc = disk.StoredAtUtc,
            FreshForSeconds = disk.FreshForSeconds,
            MaxStaleSeconds = disk.MaxStaleSeconds,
        };

        var ageSeconds = (DateTime.UtcNow - entry.StoredAtUtc).TotalSeconds;
        var remaining = Math.Max(60, entry.MaxStaleSeconds - ageSeconds);
        _memory.Set(MemKey(key), entry, TimeSpan.FromSeconds(remaining));
        _knownKeys[key] = 0;

        _logger.LogInformation("Hydrated {Key} from disk cache (age {Age:F0}s)", key, ageSeconds);
        return entry;
    }

    private void Store(string key, string json, TimeSpan freshFor, TimeSpan maxStale)
    {
        var entry = new MemEntry
        {
            Json = json,
            StoredAtUtc = DateTime.UtcNow,
            FreshForSeconds = (int)freshFor.TotalSeconds,
            MaxStaleSeconds = (int)maxStale.TotalSeconds,
        };

        _memory.Set(MemKey(key), entry, TimeSpan.FromSeconds(entry.MaxStaleSeconds));
        _disk.Save(new DiskCacheStore.Entry
        {
            Key = key,
            StoredAtUtc = entry.StoredAtUtc,
            FreshForSeconds = entry.FreshForSeconds,
            MaxStaleSeconds = entry.MaxStaleSeconds,
            Json = json,
        });

        _knownKeys[key] = 0;
    }

    private static int? TtlRemaining(MemEntry entry)
    {
        var ageSeconds = (DateTime.UtcNow - entry.StoredAtUtc).TotalSeconds;
        return Math.Max(0, (int)Math.Round(entry.FreshForSeconds - ageSeconds));
    }

    private static JsonElement ToElement(string json)
    {
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.Clone();
    }

    // ---------------------------------------------------------------- upstream

    private async Task<string> FetchSportsUpstreamAsync(CancellationToken ct)
    {
        var url = $"{_api.BaseUrl}/sports/?apiKey={_api.Key}";
        return await SendUpstreamAsync(url, ct);
    }

    private async Task<string> FetchEventsUpstreamAsync(string sport, string regions, string markets, CancellationToken ct)
    {
        var url = sport == "upcoming"
            ? $"{_api.BaseUrl}/sports/upcoming/odds/?regions={regions}&markets={markets}&apiKey={_api.Key}"
            : $"{_api.BaseUrl}/sports/{sport}/odds/?regions={regions}&markets={markets}&apiKey={_api.Key}";

        return await SendUpstreamAsync(url, ct);
    }

    private async Task<string> SendUpstreamAsync(string url, CancellationToken ct)
    {
        var client = _httpClientFactory.CreateClient("odds");
        using var response = await client.GetAsync(url, ct);

        CaptureQuota(response);

        if ((int)response.StatusCode == 429)
        {
            TripBreaker("HTTP 429 rate limit");
            throw new HttpRequestException("The Odds API returned 429 (rate limited)");
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync(ct);
    }

    private void CaptureQuota(HttpResponseMessage response)
    {
        static int? HeaderInt(HttpResponseMessage msg, string name)
        {
            var values = msg.Headers.TryGetValues(name, out var v)
                ? v
                : msg.Content.Headers.TryGetValues(name, out var cv) ? cv : null;

            var raw = values?.FirstOrDefault();
            return int.TryParse(raw, out var parsed) ? parsed : null;
        }

        var remaining = HeaderInt(response, "x-requests-remaining");
        var used = HeaderInt(response, "x-requests-used");
        var last = HeaderInt(response, "x-requests-last");

        if (remaining is null && used is null && last is null) return;

        lock (_quotaGate)
        {
            if (remaining.HasValue) _quota.Remaining = remaining.Value;
            if (used.HasValue) _quota.Used = used.Value;
            if (last.HasValue) _quota.LastCost = last.Value;
            _quota.LastUpdated = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            _disk.SaveQuota(_quota);
        }

        if (_quota.Remaining < _cache.MinQuotaFloor)
        {
            _logger.LogWarning(
                "Odds API quota is below the configured floor ({Remaining} < {Floor}); live calls are disabled",
                _quota.Remaining, _cache.MinQuotaFloor);
        }
    }

    // ---------------------------------------------------------------- circuit breaker

    private bool CanCallUpstream(bool isFreeCall)
    {
        lock (_breakerGate)
        {
            if (_backoffUntilUtc.HasValue && DateTime.UtcNow < _backoffUntilUtc.Value) return false;
        }

        if (isFreeCall) return true;

        lock (_quotaGate)
        {
            return _quota.Remaining >= _cache.MinQuotaFloor;
        }
    }

    private void TripBreaker(string reason)
    {
        lock (_breakerGate)
        {
            _backoffLevel = Math.Min(_backoffLevel + 1, 5);
            var seconds = Math.Min(30 * Math.Pow(4, _backoffLevel - 1), 600);
            _backoffUntilUtc = DateTime.UtcNow.AddSeconds(seconds);
            _logger.LogWarning("Odds API circuit breaker tripped ({Reason}); backing off {Seconds}s", reason, seconds);
        }
    }
}

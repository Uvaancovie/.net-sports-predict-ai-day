using System.Text.Json;
using Microsoft.Extensions.Options;

namespace SportsPredictor.Api.Services;

public sealed class QuotaState
{
    public int Remaining { get; set; } = 500;
    public int Used { get; set; }
    public int LastCost { get; set; }
    public string LastUpdated { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
}

/// <summary>
/// L2 cache: crash-safe JSON files on disk so a server restart never re-burns Odds API credits.
/// </summary>
public sealed class DiskCacheStore
{
    private readonly string _root;
    private readonly ILogger<DiskCacheStore> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public sealed class Entry
    {
        public string Key { get; set; } = "";
        public DateTime StoredAtUtc { get; set; }
        public int FreshForSeconds { get; set; }
        public int MaxStaleSeconds { get; set; }
        public string Json { get; set; } = "";
    }

    public DiskCacheStore(IOptions<OddsCacheOptions> options, IHostEnvironment env, ILogger<DiskCacheStore> logger)
    {
        _logger = logger;
        _root = Path.Combine(env.ContentRootPath, options.Value.DiskCachePath);
        try
        {
            Directory.CreateDirectory(_root);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not create disk cache directory {Root}", _root);
        }
    }

    private string PathFor(string key) => Path.Combine(_root, Sanitize(key) + ".json");

    private static string Sanitize(string key)
    {
        var chars = key.Select(c => char.IsLetterOrDigit(c) || c is '-' or '_' ? c : '_').ToArray();
        return new string(chars);
    }

    public void Save(Entry entry)
    {
        try
        {
            var path = PathFor(entry.Key);
            var temp = path + ".tmp";
            File.WriteAllText(temp, JsonSerializer.Serialize(entry, JsonOptions));
            File.Move(temp, path, overwrite: true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed writing cache entry {Key}", entry.Key);
        }
    }

    public Entry? Load(string key)
    {
        try
        {
            var path = PathFor(key);
            if (!File.Exists(path)) return null;
            return JsonSerializer.Deserialize<Entry>(File.ReadAllText(path), JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed reading cache entry {Key}", key);
            return null;
        }
    }

    public void Delete(string key)
    {
        try
        {
            var path = PathFor(key);
            if (File.Exists(path)) File.Delete(path);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed deleting cache entry {Key}", key);
        }
    }

    public void Clear()
    {
        try
        {
            foreach (var file in Directory.EnumerateFiles(_root, "*.json"))
            {
                File.Delete(file);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed clearing disk cache");
        }
    }

    public QuotaState LoadQuota()
    {
        try
        {
            var path = Path.Combine(_root, "quota.json");
            if (!File.Exists(path)) return new QuotaState();
            return JsonSerializer.Deserialize<QuotaState>(File.ReadAllText(path), JsonOptions) ?? new QuotaState();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed reading persisted quota");
            return new QuotaState();
        }
    }

    public void SaveQuota(QuotaState state)
    {
        try
        {
            var path = Path.Combine(_root, "quota.json");
            var temp = path + ".tmp";
            File.WriteAllText(temp, JsonSerializer.Serialize(state, JsonOptions));
            File.Move(temp, path, overwrite: true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed persisting quota telemetry");
        }
    }
}

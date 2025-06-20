using CineLog.Core.DTOs.External;
using CineLog.Core.Entities;
using CineLog.Core.Interfaces.External;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CineLog.Infrastructure.External;

public class TmdbApiService : ITmdbApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TmdbApiService> _logger;
    private readonly string _apiKey;
    private readonly JsonSerializerOptions _jsonOptions;

    public TmdbApiService(HttpClient httpClient, IConfiguration configuration, ILogger<TmdbApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = configuration["TMDb:ApiKey"] ?? throw new InvalidOperationException("TMDb API key is required");

        // Configure JSON options
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
        };

        // Set base address and default headers
        _httpClient.BaseAddress = new Uri("https://api.themoviedb.org/3/");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    public async Task<TmdbSearchResponse> SearchMoviesAsync(string query, int page = 1, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Searching movies with query: {Query}, page: {Page}", query, page);

            // Use query parameter instead of header
            var url = $"search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&page={page}";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<TmdbSearchResponse>(jsonString, _jsonOptions);

            _logger.LogInformation("Found {Count} movies for query: {Query}", result?.Results.Count ?? 0, query);

            return result ?? new TmdbSearchResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching movies with query: {Query}", query);
            throw;
        }
    }

    public async Task<TmdbSearchResponse> SearchTvShowsAsync(string query, int page = 1, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Searching TV shows with query: {Query}, page: {Page}", query, page);

            var url = $"search/tv?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&page={page}";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<TmdbSearchResponse>(jsonString, _jsonOptions);

            _logger.LogInformation("Found {Count} TV shows for query: {Query}", result?.Results.Count ?? 0, query);

            return result ?? new TmdbSearchResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching TV shows with query: {Query}", query);
            throw;
        }
    }

    public async Task<TmdbMovieDetails> GetMovieDetailsAsync(int movieId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting movie details for ID: {MovieId}", movieId);

            var url = $"movie/{movieId}?api_key={_apiKey}";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<TmdbMovieDetails>(jsonString, _jsonOptions);

            _logger.LogInformation("Retrieved details for movie: {Title}", result?.Title);

            return result ?? throw new InvalidOperationException($"Movie with ID {movieId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting movie details for ID: {MovieId}", movieId);
            throw;
        }
    }

    public async Task<TmdbTvDetails> GetTvDetailsAsync(int tvId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting TV show details for ID: {TvId}", tvId);

            var url = $"tv/{tvId}?api_key={_apiKey}";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<TmdbTvDetails>(jsonString, _jsonOptions);

            _logger.LogInformation("Retrieved details for TV show: {Name}", result?.Name);

            return result ?? throw new InvalidOperationException($"Failed to retrieve TV show details for ID: {tvId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting TV show details for ID: {TvId}", tvId);
            throw;
        }
    }

    public async Task<TmdbSearchResponse> GetTrendingAsync(string mediaType = "all", string timeWindow = "week", CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting trending {MediaType} for {TimeWindow}", mediaType, timeWindow);

            var url = $"trending/{mediaType}/{timeWindow}?api_key={_apiKey}";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<TmdbSearchResponse>(jsonString, _jsonOptions);

            _logger.LogInformation("Retrieved {Count} trending items", result?.Results.Count ?? 0);

            return result ?? new TmdbSearchResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trending {MediaType} for {TimeWindow}", mediaType, timeWindow);
            throw;
        }
    }

    public async Task<TmdbSearchResponse> DiscoverMoviesAsync(int? year = null, string? genre = null, int page = 1, CancellationToken cancellationToken = default)
    {
        try
        {
            var queryParams = new List<string> { $"api_key={_apiKey}", $"page={page}" };

            if (year.HasValue)
                queryParams.Add($"year={year}");

            if (!string.IsNullOrEmpty(genre))
                queryParams.Add($"with_genres={genre}");

            var queryString = string.Join("&", queryParams);

            _logger.LogInformation("Discovering movies with params: {QueryString}", queryString);

            var url = $"discover/movie?{queryString}";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<TmdbSearchResponse>(jsonString, _jsonOptions);

            _logger.LogInformation("Discovered {Count} movies", result?.Results.Count ?? 0);

            return result ?? new TmdbSearchResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error discovering movies");
            throw;
        }
    }
    public async Task<TmdbSearchResponse> DiscoverTvShowsAsync(int? year = null, string? genre = null, int page = 1, CancellationToken cancellationToken = default)
    {
        try
        {
            var queryParams = new List<string> { $"page={page}" };

            if (year.HasValue)
                queryParams.Add($"year={year}");

            if (!string.IsNullOrEmpty(genre))
                queryParams.Add($"with_genres={genre}");

            var queryString = string.Join("&", queryParams);

            _logger.LogInformation("Discovering tv with params: {QueryString}", queryString);

            var response = await _httpClient.GetAsync($"discover/tv?{queryString}", cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<TmdbSearchResponse>(jsonString, _jsonOptions);

            _logger.LogInformation("Discovered {Count} tv", result?.Results.Count ?? 0);

            return result ?? new TmdbSearchResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error discovering tv");
            throw;
        }
    }

    public async Task<TmdbConfiguration> GetConfigurationAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting TMDb configuration");

            var url = $"configuration?api_key={_apiKey}";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<TmdbConfiguration>(jsonString, _jsonOptions);

            _logger.LogInformation("Retrieved TMDb configuration");

            return result ?? throw new InvalidOperationException("Failed to retrieve TMDb configuration");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting TMDb configuration");
            throw;
        }
    }
}

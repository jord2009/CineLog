using CineLog.Core.DTOs.External;

namespace CineLog.Core.Interfaces.External;

public interface ITmdbApiService
{
    Task<TmdbSearchResponse> SearchMoviesAsync(string query, int page = 1, CancellationToken cancellationToken = default);
    Task<TmdbSearchResponse> SearchTvShowsAsync(string query, int page = 1, CancellationToken cancellationToken = default);
    Task<TmdbMovieDetails> GetMovieDetailsAsync(int movieId, CancellationToken cancellationToken = default);
    Task<TmdbTvDetails> GetTvDetailsAsync(int tvId, CancellationToken cancellationToken = default);
    Task<TmdbSearchResponse> GetTrendingAsync(string mediaType = "all", string timeWindow = "week", CancellationToken cancellationToken = default);
    Task<TmdbSearchResponse> DiscoverMoviesAsync(int? year = null, string? genre = null, int page = 1, CancellationToken cancellationToken = default);
    Task<TmdbSearchResponse> DiscoverTvShowsAsync(int? year = null, string? genre = null, int page = 1, CancellationToken cancellationToken = default);
    Task<TmdbConfiguration> GetConfigurationAsync(CancellationToken cancellationToken = default);
}
using CineLog.Core.Entities;

namespace CineLog.Core.Interfaces.Repositories;

public interface IMediaRepository : IRepository<Media>
{
    Task<Media?> GetByTmdbIdAsync(int tmdbId, MediaType mediaType, CancellationToken cancellationToken = default);
    Task<IEnumerable<Media>> SearchByTitleAsync(string title, CancellationToken cancellationToken = default);
    Task<IEnumerable<Media>> GetTrendingAsync(MediaType? mediaType = null, int count = 20, CancellationToken cancellationToken = default);
    Task<IEnumerable<Media>> GetTopRatedAsync(MediaType? mediaType = null, int count = 20, CancellationToken cancellationToken = default);
    Task<IEnumerable<Media>> GetRecentlyAddedAsync(int count = 20, CancellationToken cancellationToken = default);
    Task<Media?> GetWithRatingsAsync(Guid mediaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Media>> GetByGenreAsync(string genre, MediaType? mediaType = null, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<IEnumerable<Media>> GetByYearAsync(int year, MediaType? mediaType = null, CancellationToken cancellationToken = default);
}
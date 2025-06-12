using CineLog.Core.Entities;

namespace CineLog.Core.Interfaces.Repositories;

public interface IRatingRepository : IRepository<UserRating>
{
    Task<UserRating?> GetByUserAndMediaAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserRating>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserRating>> GetByMediaAsync(Guid mediaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserRating>> GetTopRatedByUserAsync(Guid userId, int count = 10, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserRating>> GetRecentRatingsByUserAsync(Guid userId, int count = 10, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserRating>> GetRatingsWithReviewsAsync(Guid? userId = null, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<decimal> GetAverageRatingForMediaAsync(Guid mediaId, CancellationToken cancellationToken = default);
    Task<int> GetRatingCountForMediaAsync(Guid mediaId, CancellationToken cancellationToken = default);
    Task<bool> HasUserRatedMediaAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken = default);
}
using CineLog.Core.DTOs.Requests;
using CineLog.Core.DTOs.Responses;

namespace CineLog.Core.Interfaces.Services;

public interface IRatingService
{
    Task<RatingResponse> CreateOrUpdateRatingAsync(CreateRatingRequest request, CancellationToken cancellationToken = default);
    Task<RatingResponse?> GetUserRatingForMediaAsync(int tmdbId, string mediaType, CancellationToken cancellationToken = default);
    Task<IEnumerable<RatingResponse>> GetUserRatingsAsync(Guid? userId = null, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<MediaRatingStatsResponse> GetMediaRatingStatsAsync(int tmdbId, string mediaType, CancellationToken cancellationToken = default);
    Task<bool> DeleteRatingAsync(Guid ratingId, CancellationToken cancellationToken = default);
}
using CineLog.Core.DTOs.Requests;
using CineLog.Core.DTOs.Responses;
using CineLog.Core.Entities;
using CineLog.Core.Exceptions;
using CineLog.Core.Interfaces.Common;
using CineLog.Core.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace CineLog.Core.Services;

public class RatingService : IRatingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMediaService _mediaService;
    private readonly ILogger<RatingService> _logger;

    public RatingService(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMediaService mediaService,
        ILogger<RatingService> logger)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mediaService = mediaService;
        _logger = logger;
    }

    public async Task<RatingResponse> CreateOrUpdateRatingAsync(CreateRatingRequest request, CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.GetUserId();

        _logger.LogInformation("User {UserId} rating TMDb {MediaType} {TmdbId} with score {Rating}",
            userId, request.MediaType, request.TmdbId, request.Rating);

        // Get or create the media from TMDb
        var media = await _mediaService.GetOrCreateMediaFromTmdbAsync(request.TmdbId, request.MediaType, cancellationToken);

        // Check if user has already rated this media
        var existingRating = await _unitOfWork.Ratings.FirstOrDefaultAsync(
            r => r.UserId == userId && r.MediaId == media.Id,
            cancellationToken);

        UserRating rating;

        if (existingRating != null)
        {
            // Update existing rating
            _logger.LogInformation("Updating existing rating {RatingId}", existingRating.Id);
            existingRating.Update(request.Rating, request.Review, request.IsSpoiler);
            rating = existingRating;
        }
        else
        {
            // Create new rating
            _logger.LogInformation("Creating new rating for user {UserId} and media {MediaId}", userId, media.Id);
            rating = UserRating.Create(userId, media.Id, request.Rating, request.Review, request.IsSpoiler);
            await _unitOfWork.Ratings.AddAsync(rating, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully saved rating {RatingId} for {MediaTitle}", rating.Id, media.Title);

        return await MapToRatingResponseAsync(rating, cancellationToken);
    }

    public async Task<RatingResponse?> GetUserRatingForMediaAsync(int tmdbId, string mediaType, CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.GetUserId();

        // Parse media type
        if (!Enum.TryParse<MediaType>(mediaType, true, out var parsedMediaType))
        {
            throw new DomainException($"Invalid media type: {mediaType}");
        }

        // Find the media in our database
        var media = await _unitOfWork.Media.FirstOrDefaultAsync(
            m => m.TmdbId == tmdbId && m.MediaType == parsedMediaType,
            cancellationToken);

        if (media == null)
        {
            return null; // User hasn't rated this media (and it's not in our database)
        }

        // Find the user's rating
        var rating = await _unitOfWork.Ratings.FirstOrDefaultAsync(
            r => r.UserId == userId && r.MediaId == media.Id,
            cancellationToken);

        if (rating == null)
        {
            return null;
        }

        return await MapToRatingResponseAsync(rating, cancellationToken);
    }

    public async Task<IEnumerable<RatingResponse>> GetUserRatingsAsync(Guid? userId = null, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var targetUserId = userId ?? _currentUserService.GetUserId();

        // For now, get all ratings (we'll implement pagination later)
        var ratings = await _unitOfWork.Ratings.FindAsync(r => r.UserId == targetUserId, cancellationToken);

        var ratingResponses = new List<RatingResponse>();

        foreach (var rating in ratings.OrderByDescending(r => r.CreatedAt))
        {
            ratingResponses.Add(await MapToRatingResponseAsync(rating, cancellationToken));
        }

        return ratingResponses;
    }

    public async Task<MediaRatingStatsResponse> GetMediaRatingStatsAsync(int tmdbId, string mediaType, CancellationToken cancellationToken = default)
    {
        // Parse media type
        if (!Enum.TryParse<MediaType>(mediaType, true, out var parsedMediaType))
        {
            throw new DomainException($"Invalid media type: {mediaType}");
        }

        // Find the media
        var media = await _unitOfWork.Media.FirstOrDefaultAsync(
            m => m.TmdbId == tmdbId && m.MediaType == parsedMediaType,
            cancellationToken);

        if (media == null)
        {
            throw new DomainException($"Media not found: TMDb ID {tmdbId}");
        }

        // Get all ratings for this media
        var ratings = await _unitOfWork.Ratings.FindAsync(r => r.MediaId == media.Id, cancellationToken);
        var ratingsList = ratings.ToList();

        var stats = new MediaRatingStatsResponse
        {
            MediaId = media.Id,
            TmdbId = media.TmdbId,
            MediaTitle = media.Title,
            MediaType = media.MediaType.ToString().ToLower(),
            TotalRatings = ratingsList.Count
        };

        if (ratingsList.Any())
        {
            stats.AverageRating = Math.Round(ratingsList.Average(r => r.Rating), 1);

            // Calculate star distribution (simplified)
            stats.FiveStarRatings = ratingsList.Count(r => r.Rating >= 9);
            stats.FourStarRatings = ratingsList.Count(r => r.Rating >= 7 && r.Rating < 9);
            stats.ThreeStarRatings = ratingsList.Count(r => r.Rating >= 5 && r.Rating < 7);
            stats.TwoStarRatings = ratingsList.Count(r => r.Rating >= 3 && r.Rating < 5);
            stats.OneStarRatings = ratingsList.Count(r => r.Rating < 3);

            // Get recent ratings
            var recentRatings = ratingsList.OrderByDescending(r => r.CreatedAt).Take(5);
            foreach (var rating in recentRatings)
            {
                stats.RecentRatings.Add(await MapToRatingResponseAsync(rating, cancellationToken));
            }
        }

        return stats;
    }

    public async Task<bool> DeleteRatingAsync(Guid ratingId, CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.GetUserId();

        var rating = await _unitOfWork.Ratings.GetByIdAsync(ratingId, cancellationToken);

        if (rating == null)
        {
            return false;
        }

        // Check if the rating belongs to the current user
        if (rating.UserId != userId)
        {
            throw new DomainException("You can only delete your own ratings");
        }

        _unitOfWork.Ratings.Remove(rating);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted rating {RatingId} by user {UserId}", ratingId, userId);

        return true;
    }

    private async Task<RatingResponse> MapToRatingResponseAsync(UserRating rating, CancellationToken cancellationToken)
    {
        // Get user info
        var user = await _unitOfWork.Users.GetByIdAsync(rating.UserId, cancellationToken);

        // Get media info
        var media = await _unitOfWork.Media.GetByIdAsync(rating.MediaId, cancellationToken);

        return new RatingResponse
        {
            Id = rating.Id,
            UserId = rating.UserId,
            MediaId = rating.MediaId,
            Rating = rating.Rating,
            Review = rating.Review,
            IsSpoiler = rating.IsSpoiler,
            CreatedAt = rating.CreatedAt,
            UpdatedAt = rating.UpdatedAt,

            // User info
            Username = user?.Username ?? "Unknown User",
            UserAvatarUrl = user?.AvatarUrl,

            // Media info
            MediaTitle = media?.Title ?? "Unknown Media",
            MediaPosterUrl = media?.PosterPath,
            MediaType = media?.MediaType.ToString().ToLower() ?? "unknown",
            TmdbId = media?.TmdbId ?? 0,

            // Display helpers
            StarRating = rating.GetStarRating()
        };
    }
}
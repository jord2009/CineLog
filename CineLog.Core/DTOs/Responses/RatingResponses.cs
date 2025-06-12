namespace CineLog.Core.DTOs.Responses;

public class RatingResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid MediaId { get; set; }
    public decimal Rating { get; set; }
    public string? Review { get; set; }
    public bool IsSpoiler { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // User information
    public string Username { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }

    // Media information
    public string MediaTitle { get; set; } = string.Empty;
    public string? MediaPosterUrl { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public int TmdbId { get; set; }

    // Display helpers
    public string StarRating { get; set; } = string.Empty; 
    public bool HasReview => !string.IsNullOrWhiteSpace(Review);
}

public class MediaRatingStatsResponse
{
    public Guid MediaId { get; set; }
    public int TmdbId { get; set; }
    public string MediaTitle { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;

    public decimal AverageRating { get; set; }
    public int TotalRatings { get; set; }

    // Rating distribution
    public int FiveStarRatings { get; set; }
    public int FourStarRatings { get; set; }
    public int ThreeStarRatings { get; set; }
    public int TwoStarRatings { get; set; }
    public int OneStarRatings { get; set; }

    public Dictionary<decimal, int> RatingDistribution { get; set; } = new();

    // Recent ratings
    public List<RatingResponse> RecentRatings { get; set; } = new();
}
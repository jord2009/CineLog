using CineLog.Core.Exceptions;

namespace CineLog.Core.Entities;

public class UserRating
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid MediaId { get; private set; }
    public decimal Rating { get; private set; }
    public string? Review { get; private set; }
    public bool IsSpoiler { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;
    public Media Media { get; private set; } = null!;

    // Private constructor for EF
    private UserRating() { }

    // Factory method with business rules
    public static UserRating Create(Guid userId, Guid mediaId, decimal rating, string? review = null, bool isSpoiler = false)
    {
        ValidateRating(rating);

        return new UserRating
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MediaId = mediaId,
            Rating = rating,
            Review = review?.Trim(),
            IsSpoiler = isSpoiler,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    // Business logic methods
    public void UpdateRating(decimal newRating)
    {
        ValidateRating(newRating);
        Rating = newRating;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateReview(string? review, bool isSpoiler = false)
    {
        Review = review?.Trim();
        IsSpoiler = isSpoiler;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(decimal rating, string? review = null, bool isSpoiler = false)
    {
        UpdateRating(rating);
        UpdateReview(review, isSpoiler);
    }

    public bool HasReview()
    {
        return !string.IsNullOrWhiteSpace(Review);
    }

    public string GetStarRating()
    {
        var fullStars = (int)Math.Floor(Rating / 2);
        var hasHalfStar = Rating % 2 >= 1;

        return new string('★', fullStars) +
               (hasHalfStar ? "☆" : "") +
               new string('☆', 5 - fullStars - (hasHalfStar ? 1 : 0));
    }

    // Validation
    private static void ValidateRating(decimal rating)
    {
        if (rating < 0.5m || rating > 10m)
            throw new DomainException("Rating must be between 0.5 and 10");

        if (rating % 0.5m != 0)
            throw new DomainException("Rating must be in increments of 0.5");
    }
}

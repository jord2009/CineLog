using CineLog.Core.Exceptions;

namespace CineLog.Core.Entities;

public class User
{
    // Private setters for encapsulation
    public Guid Id { get; private set; }
    public string Username { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
    public string? Bio { get; private set; }
    public string? AvatarUrl { get; private set; }
    public bool IsEmailVerified { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Navigation properties
    private readonly List<UserRating> _ratings = new();
    public IReadOnlyCollection<UserRating> Ratings => _ratings.AsReadOnly();

    private readonly List<Watchlist> _watchlists = new();
    public IReadOnlyCollection<Watchlist> Watchlists => _watchlists.AsReadOnly();

    private readonly List<UserFollow> _following = new();
    public IReadOnlyCollection<UserFollow> Following => _following.AsReadOnly();

    private readonly List<UserFollow> _followers = new();
    public IReadOnlyCollection<UserFollow> Followers => _followers.AsReadOnly();

    // Private constructor for EF
    private User() { }

    // Factory method - enforces business rules
    public static User Create(string username, string email, string passwordHash,
        string? firstName = null, string? lastName = null)
    {
        ValidateUsername(username);
        ValidateEmail(email);

        return new User
        {
            Id = Guid.NewGuid(),
            Username = username.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHash,
            FirstName = firstName?.Trim(),
            LastName = lastName?.Trim(),
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    // Business logic methods
    public void UpdateProfile(string? firstName, string? lastName, string? bio)
    {
        FirstName = firstName?.Trim();
        LastName = lastName?.Trim();
        Bio = bio?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            throw new DomainException("Password hash cannot be empty");

        PasswordHash = newPasswordHash;
        UpdatedAt = DateTime.UtcNow;
    }

    public void VerifyEmail()
    {
        IsEmailVerified = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateAvatar(string avatarUrl)
    {
        if (!string.IsNullOrWhiteSpace(avatarUrl) && !Uri.IsWellFormedUriString(avatarUrl, UriKind.Absolute))
            throw new DomainException("Avatar URL must be a valid URL");

        AvatarUrl = avatarUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool CanRateMedia(Media media)
    {
        // Business rule: Can't rate adult content if user profile suggests they're underage
        return !media.Adult || IsEmailVerified; // Simplified rule
    }

    public bool HasRatedMedia(Guid mediaId)
    {
        return _ratings.Any(r => r.MediaId == mediaId);
    }

    public UserRating? GetRatingForMedia(Guid mediaId)
    {
        return _ratings.FirstOrDefault(r => r.MediaId == mediaId);
    }

    // Validation methods
    private static void ValidateUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
            throw new DomainException("Username is required");

        if (username.Length < 3 || username.Length > 50)
            throw new DomainException("Username must be between 3 and 50 characters");

        if (!username.All(c => char.IsLetterOrDigit(c) || c == '_' || c == '-'))
            throw new DomainException("Username can only contain letters, numbers, underscores, and hyphens");
    }

    private static void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email is required");

        if (!email.Contains('@') || email.Length > 255)
            throw new DomainException("Invalid email format");
    }
}
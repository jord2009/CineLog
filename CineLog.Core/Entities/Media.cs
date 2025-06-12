using CineLog.Core.Exceptions;

namespace CineLog.Core.Entities;

public class Media
{
    public Guid Id { get; private set; }
    public int TmdbId { get; private set; }
    public MediaType MediaType { get; private set; }
    public string Title { get; private set; }
    public string? OriginalTitle { get; private set; }
    public string? Overview { get; private set; }
    public DateTime? ReleaseDate { get; private set; }
    public string? PosterPath { get; private set; }
    public string? BackdropPath { get; private set; }
    public string? Genres { get; private set; } // JSON serialized
    public int? Runtime { get; private set; }
    public decimal? TmdbVoteAverage { get; private set; }
    public int? TmdbVoteCount { get; private set; }
    public decimal? Popularity { get; private set; }
    public string? OriginalLanguage { get; private set; }
    public string? ProductionCountries { get; private set; } // JSON serialized
    public string? ImdbId { get; private set; }
    public bool Adult { get; private set; }
    public long? Budget { get; private set; }
    public long? Revenue { get; private set; }
    public string? Tagline { get; private set; }
    public string? Homepage { get; private set; }
    public string? Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Navigation properties
    private readonly List<UserRating> _userRatings = new();
    public IReadOnlyCollection<UserRating> UserRatings => _userRatings.AsReadOnly();

    // Private constructor for EF
    private Media() { }

    // Factory method
    public static Media CreateFromTmdb(int tmdbId, MediaType mediaType, string title)
    {
        if (tmdbId <= 0)
            throw new DomainException("TMDb ID must be positive");

        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Title is required");

        return new Media
        {
            Id = Guid.NewGuid(),
            TmdbId = tmdbId,
            MediaType = mediaType,
            Title = title.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    // Business logic methods
    public void UpdateFromTmdbData(string title, string? originalTitle, string? overview,
        DateTime? releaseDate, string? posterPath, string? backdropPath, string? genres,
        int? runtime, decimal? voteAverage, int? voteCount, decimal? popularity,
        string? originalLanguage, string? productionCountries, string? imdbId,
        bool adult, long? budget, long? revenue, string? tagline, string? homepage, string? status)
    {
        Title = title?.Trim() ?? Title;
        OriginalTitle = originalTitle?.Trim();
        Overview = overview?.Trim();
        ReleaseDate = releaseDate;
        PosterPath = posterPath?.Trim();
        BackdropPath = backdropPath?.Trim();
        Genres = genres;
        Runtime = runtime;
        TmdbVoteAverage = voteAverage;
        TmdbVoteCount = voteCount;
        Popularity = popularity;
        OriginalLanguage = originalLanguage?.Trim();
        ProductionCountries = productionCountries;
        ImdbId = imdbId?.Trim();
        Adult = adult;
        Budget = budget;
        Revenue = revenue;
        Tagline = tagline?.Trim();
        Homepage = homepage?.Trim();
        Status = status?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public decimal CalculateUserRating()
    {
        if (!_userRatings.Any())
            return 0;

        return Math.Round(_userRatings.Average(r => r.Rating), 1);
    }

    public int GetUserRatingCount()
    {
        return _userRatings.Count;
    }

    public bool HasBeenRatedByUser(Guid userId)
    {
        return _userRatings.Any(r => r.UserId == userId);
    }

    public string GetDisplayTitle()
    {
        return !string.IsNullOrWhiteSpace(OriginalTitle) && OriginalTitle != Title
            ? $"{Title} ({OriginalTitle})"
            : Title;
    }

    public string GetFullPosterUrl(string baseImageUrl, string size = "w500")
    {
        return string.IsNullOrWhiteSpace(PosterPath)
            ? string.Empty
            : $"{baseImageUrl.TrimEnd('/')}/{size}{PosterPath}";
    }

    public string GetFullBackdropUrl(string baseImageUrl, string size = "w1280")
    {
        return string.IsNullOrWhiteSpace(BackdropPath)
            ? string.Empty
            : $"{baseImageUrl.TrimEnd('/')}/{size}{BackdropPath}";
    }
}
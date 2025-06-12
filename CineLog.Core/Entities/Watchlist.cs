using CineLog.Core.Exceptions;

namespace CineLog.Core.Entities;

public class Watchlist
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsPublic { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;
    private readonly List<WatchlistItem> _items = new();
    public IReadOnlyCollection<WatchlistItem> Items => _items.AsReadOnly();

    // Private constructor for EF
    private Watchlist() { }

    // Factory method
    public static Watchlist Create(Guid userId, string name, string? description = null, bool isPublic = true)
    {
        ValidateName(name);

        return new Watchlist
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name.Trim(),
            Description = description?.Trim(),
            IsPublic = isPublic,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    // Business logic methods
    public void UpdateDetails(string name, string? description = null, bool? isPublic = null)
    {
        ValidateName(name);

        Name = name.Trim();
        Description = description?.Trim();
        if (isPublic.HasValue)
            IsPublic = isPublic.Value;

        UpdatedAt = DateTime.UtcNow;
    }

    public void AddMedia(Guid mediaId, WatchStatus status = WatchStatus.WantToWatch)
    {
        if (_items.Any(i => i.MediaId == mediaId))
            throw new DomainException("Media is already in this watchlist");

        var item = WatchlistItem.Create(Id, mediaId, status);
        _items.Add(item);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveMedia(Guid mediaId)
    {
        var item = _items.FirstOrDefault(i => i.MediaId == mediaId);
        if (item == null)
            throw new DomainException("Media is not in this watchlist");

        _items.Remove(item);
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateMediaStatus(Guid mediaId, WatchStatus status)
    {
        var item = _items.FirstOrDefault(i => i.MediaId == mediaId);
        if (item == null)
            throw new DomainException("Media is not in this watchlist");

        item.UpdateStatus(status);
        UpdatedAt = DateTime.UtcNow;
    }

    public int GetItemCount()
    {
        return _items.Count;
    }

    public bool ContainsMedia(Guid mediaId)
    {
        return _items.Any(i => i.MediaId == mediaId);
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Watchlist name is required");

        if (name.Length > 100)
            throw new DomainException("Watchlist name cannot exceed 100 characters");
    }
}

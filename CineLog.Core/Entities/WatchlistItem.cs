namespace CineLog.Core.Entities;

public class WatchlistItem
{
    public Guid Id { get; private set; }
    public Guid WatchlistId { get; private set; }
    public Guid MediaId { get; private set; }
    public WatchStatus Status { get; private set; }
    public DateTime AddedAt { get; private set; }

    // Navigation properties
    public Watchlist Watchlist { get; private set; } = null!;
    public Media Media { get; private set; } = null!;

    // Private constructor for EF
    private WatchlistItem() { }

    // Factory method
    public static WatchlistItem Create(Guid watchlistId, Guid mediaId, WatchStatus status)
    {
        return new WatchlistItem
        {
            Id = Guid.NewGuid(),
            WatchlistId = watchlistId,
            MediaId = mediaId,
            Status = status,
            AddedAt = DateTime.UtcNow
        };
    }

    // Business logic methods
    public void UpdateStatus(WatchStatus status)
    {
        Status = status;
    }
}

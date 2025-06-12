using CineLog.Core.Entities;

namespace CineLog.Core.Interfaces.Repositories;

public interface IWatchlistRepository : IRepository<Watchlist>
{
    Task<IEnumerable<Watchlist>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Watchlist?> GetWithItemsAsync(Guid watchlistId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Watchlist>> GetPublicWatchlistsAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<IEnumerable<Watchlist>> SearchWatchlistsAsync(string searchTerm, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<bool> IsMediaInUserWatchlistAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken = default);
    Task<Watchlist?> GetUserDefaultWatchlistAsync(Guid userId, WatchStatus status, CancellationToken cancellationToken = default);
}
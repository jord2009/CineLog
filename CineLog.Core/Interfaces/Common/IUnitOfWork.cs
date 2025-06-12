using CineLog.Core.Interfaces.Repositories;

namespace CineLog.Core.Interfaces.Common;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IMediaRepository Media { get; }
    IRatingRepository Ratings { get; }
    IWatchlistRepository Watchlists { get; }
    IUserFollowRepository UserFollows { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
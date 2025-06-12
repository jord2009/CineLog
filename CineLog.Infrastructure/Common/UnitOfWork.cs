using CineLog.Core.Interfaces.Common;
using CineLog.Core.Interfaces.Repositories;
using CineLog.Infrastructure.Data;
using CineLog.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace CineLog.Infrastructure.Common;

public class UnitOfWork : IUnitOfWork
{
    private readonly CineLogDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(CineLogDbContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        // We'll add these as we implement them
        Media = new MediaRepository(context);
        Ratings = new RatingRepository(context);
        Watchlists = new WatchlistRepository(context);
        UserFollows = new UserFollowRepository(context);
    }

    public IUserRepository Users { get; }
    public IMediaRepository Media { get; }
    public IRatingRepository Ratings { get; }
    public IWatchlistRepository Watchlists { get; }
    public IUserFollowRepository UserFollows { get; }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context?.Dispose();
    }
}

// Placeholder repositories - we'll implement these later
public class MediaRepository : BaseRepository<Core.Entities.Media>, IMediaRepository
{
    public MediaRepository(CineLogDbContext context) : base(context) { }

    // TODO: Implement all interface methods
    public Task<Core.Entities.Media?> GetByTmdbIdAsync(int tmdbId, Core.Entities.MediaType mediaType, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.Media>> SearchByTitleAsync(string title, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.Media>> GetTrendingAsync(Core.Entities.MediaType? mediaType = null, int count = 20, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.Media>> GetTopRatedAsync(Core.Entities.MediaType? mediaType = null, int count = 20, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.Media>> GetRecentlyAddedAsync(int count = 20, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<Core.Entities.Media?> GetWithRatingsAsync(Guid mediaId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.Media>> GetByGenreAsync(string genre, Core.Entities.MediaType? mediaType = null, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.Media>> GetByYearAsync(int year, Core.Entities.MediaType? mediaType = null, CancellationToken cancellationToken = default) => throw new NotImplementedException();
}

public class RatingRepository : BaseRepository<Core.Entities.UserRating>, IRatingRepository
{
    public RatingRepository(CineLogDbContext context) : base(context) { }

    // TODO: Implement all interface methods - just stubs for now
    public Task<Core.Entities.UserRating?> GetByUserAndMediaAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.UserRating>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.UserRating>> GetByMediaAsync(Guid mediaId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.UserRating>> GetTopRatedByUserAsync(Guid userId, int count = 10, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.UserRating>> GetRecentRatingsByUserAsync(Guid userId, int count = 10, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.UserRating>> GetRatingsWithReviewsAsync(Guid? userId = null, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<decimal> GetAverageRatingForMediaAsync(Guid mediaId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<int> GetRatingCountForMediaAsync(Guid mediaId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<bool> HasUserRatedMediaAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
}

public class WatchlistRepository : BaseRepository<Core.Entities.Watchlist>, IWatchlistRepository
{
    public WatchlistRepository(CineLogDbContext context) : base(context) { }

    // TODO: Implement all interface methods - just stubs for now
    public Task<IEnumerable<Core.Entities.Watchlist>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<Core.Entities.Watchlist?> GetWithItemsAsync(Guid watchlistId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.Watchlist>> GetPublicWatchlistsAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.Watchlist>> SearchWatchlistsAsync(string searchTerm, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<bool> IsMediaInUserWatchlistAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<Core.Entities.Watchlist?> GetUserDefaultWatchlistAsync(Guid userId, Core.Entities.WatchStatus status, CancellationToken cancellationToken = default) => throw new NotImplementedException();
}

public class UserFollowRepository : BaseRepository<Core.Entities.UserFollow>, IUserFollowRepository
{
    public UserFollowRepository(CineLogDbContext context) : base(context) { }

    // TODO: Implement all interface methods - just stubs for now
    public Task<bool> IsFollowingAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<Core.Entities.UserFollow?> GetFollowRelationshipAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.UserFollow>> GetFollowersAsync(Guid userId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<IEnumerable<Core.Entities.UserFollow>> GetFollowingAsync(Guid userId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<int> GetFollowerCountAsync(Guid userId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    public Task<int> GetFollowingCountAsync(Guid userId, CancellationToken cancellationToken = default) => throw new NotImplementedException();
}
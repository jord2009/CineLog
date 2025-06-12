using CineLog.Core.Entities;
using CineLog.Core.Interfaces.Repositories;
using CineLog.Infrastructure.Data;

namespace CineLog.Infrastructure.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(CineLogDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
    }

    public async Task<bool> IsEmailTakenAsync(string email, CancellationToken cancellationToken = default)
    {
        return await AnyAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public async Task<bool> IsUsernameTakenAsync(string username, CancellationToken cancellationToken = default)
    {
        return await AnyAsync(u => u.Username == username, cancellationToken);
    }
    public Task<User?> GetWithRatingsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return GetByIdAsync(userId, cancellationToken);
    }

    public Task<User?> GetWithWatchlistsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return GetByIdAsync(userId, cancellationToken);
    }

    public Task<IEnumerable<User>> SearchUsersAsync(string searchTerm, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        return FindAsync(u => u.Username.Contains(searchTerm), cancellationToken);
    }

    public Task<IEnumerable<User>> GetFollowersAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Enumerable.Empty<User>());
    }

    public Task<IEnumerable<User>> GetFollowingAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Enumerable.Empty<User>());
    }
}
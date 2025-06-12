using CineLog.Core.Entities;

namespace CineLog.Core.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> IsEmailTakenAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> IsUsernameTakenAsync(string username, CancellationToken cancellationToken = default);
    Task<User?> GetWithRatingsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<User?> GetWithWatchlistsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> SearchUsersAsync(string searchTerm, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetFollowersAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetFollowingAsync(Guid userId, CancellationToken cancellationToken = default);
}
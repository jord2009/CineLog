using CineLog.Core.Entities;

namespace CineLog.Core.Interfaces.Repositories;

public interface IUserFollowRepository : IRepository<UserFollow>
{
    Task<bool> IsFollowingAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken = default);
    Task<UserFollow?> GetFollowRelationshipAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserFollow>> GetFollowersAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserFollow>> GetFollowingAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetFollowerCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetFollowingCountAsync(Guid userId, CancellationToken cancellationToken = default);
}

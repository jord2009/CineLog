using CineLog.Core.Exceptions;

namespace CineLog.Core.Entities;

public class UserFollow
{
    public Guid Id { get; private set; }
    public Guid FollowerId { get; private set; }
    public Guid FollowingId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // Navigation properties
    public User Follower { get; private set; } = null!;
    public User Following { get; private set; } = null!;

    // Private constructor for EF
    private UserFollow() { }

    // Factory method
    public static UserFollow Create(Guid followerId, Guid followingId)
    {
        if (followerId == followingId)
            throw new DomainException("User cannot follow themselves");

        return new UserFollow
        {
            Id = Guid.NewGuid(),
            FollowerId = followerId,
            FollowingId = followingId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
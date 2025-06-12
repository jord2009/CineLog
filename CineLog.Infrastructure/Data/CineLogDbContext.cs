using CineLog.Core.Entities;
using CineLog.Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;

namespace CineLog.Infrastructure.Data;

public class CineLogDbContext : DbContext
{
    public CineLogDbContext(DbContextOptions<CineLogDbContext> options) : base(options)
    {
    }

    // DbSets for our entities
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Media> Media { get; set; } = null!;
    public DbSet<UserRating> UserRatings { get; set; } = null!;
    public DbSet<Watchlist> Watchlists { get; set; } = null!;
    public DbSet<WatchlistItem> WatchlistItems { get; set; } = null!;
    public DbSet<UserFollow> UserFollows { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        //modelBuilder.ApplyConfiguration(new MediaConfiguration());
        //modelBuilder.ApplyConfiguration(new UserRatingConfiguration());
        //modelBuilder.ApplyConfiguration(new WatchlistConfiguration());
        //modelBuilder.ApplyConfiguration(new WatchlistItemConfiguration());
        //modelBuilder.ApplyConfiguration(new UserFollowConfiguration());

        // Global configurations
        ConfigureConventions(modelBuilder);
        ConfigureIndexes(modelBuilder);
    }

    private static void ConfigureConventions(ModelBuilder modelBuilder)
    {
        // Set default string length for all string properties
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(string) && property.GetMaxLength() == null)
                {
                    property.SetMaxLength(255); // Default max length
                }
            }
        }

        // Configure all decimal properties for currency/rating precision
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
                {
                    property.SetPrecision(18);
                    property.SetScale(2);
                }
            }
        }
    }

    private static void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // Additional composite indexes for performance

        // User ratings by media and rating value
        modelBuilder.Entity<UserRating>()
            .HasIndex(r => new { r.MediaId, r.Rating })
            .HasDatabaseName("IX_UserRatings_MediaId_Rating");

        // User ratings by user and created date
        modelBuilder.Entity<UserRating>()
            .HasIndex(r => new { r.UserId, r.CreatedAt })
            .HasDatabaseName("IX_UserRatings_UserId_CreatedAt");

        // Media by type and popularity
        modelBuilder.Entity<Media>()
            .HasIndex(m => new { m.MediaType, m.Popularity })
            .HasDatabaseName("IX_Media_MediaType_Popularity");

        // Media by type and release date
        modelBuilder.Entity<Media>()
            .HasIndex(m => new { m.MediaType, m.ReleaseDate })
            .HasDatabaseName("IX_Media_MediaType_ReleaseDate");

        // Watchlist items by status
        modelBuilder.Entity<WatchlistItem>()
            .HasIndex(wi => wi.Status)
            .HasDatabaseName("IX_WatchlistItems_Status");
    }
}
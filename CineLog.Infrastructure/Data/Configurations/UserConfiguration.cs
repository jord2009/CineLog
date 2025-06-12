using CineLog.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineLog.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Table name
        builder.ToTable("users");

        // Primary key
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id)
            .HasColumnName("id")
            .ValueGeneratedNever(); // We generate Guids in the entity

        // Properties
        builder.Property(u => u.Username)
            .HasColumnName("username")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(u => u.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100);

        builder.Property(u => u.Bio)
            .HasColumnName("bio")
            .HasColumnType("text");

        builder.Property(u => u.AvatarUrl)
            .HasColumnName("avatar_url")
            .HasMaxLength(500);

        builder.Property(u => u.IsEmailVerified)
            .HasColumnName("is_email_verified")
            .HasDefaultValue(false);

        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Indexes
        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        builder.HasIndex(u => u.Username)
            .IsUnique()
            .HasDatabaseName("IX_Users_Username");

        // Relationships
        builder.HasMany(u => u.Ratings)
            .WithOne(r => r.User)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.Watchlists)
            .WithOne(w => w.User)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.Following)
            .WithOne(f => f.Follower)
            .HasForeignKey(f => f.FollowerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.Followers)
            .WithOne(f => f.Following)
            .HasForeignKey(f => f.FollowingId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete loops
    }
}
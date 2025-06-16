using CineLog.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CineLog.Infrastructure.Data.Configurations;

public class MediaConfiguration : IEntityTypeConfiguration<Media>
{
    public void Configure(EntityTypeBuilder<Media> builder)
    {
        // Table name
        builder.ToTable("media");

        // Primary key
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        // Properties
        builder.Property(m => m.TmdbId)
            .HasColumnName("tmdb_id")
            .IsRequired();

        builder.Property(m => m.MediaType)
            .HasColumnName("media_type")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(m => m.Title)
            .HasColumnName("title")
            .HasMaxLength(1000)  // Increased for long movie titles
            .IsRequired();

        builder.Property(m => m.OriginalTitle)
            .HasColumnName("original_title")
            .HasMaxLength(1000);  // Increased for long original titles

        builder.Property(m => m.Overview)
            .HasColumnName("overview")
            .HasColumnType("text");  // No length limit for movie descriptions

        builder.Property(m => m.ReleaseDate)
            .HasColumnName("release_date")
            .HasColumnType("date");

        builder.Property(m => m.PosterPath)
            .HasColumnName("poster_path")
            .HasMaxLength(500);

        builder.Property(m => m.BackdropPath)
            .HasColumnName("backdrop_path")
            .HasMaxLength(500);

        builder.Property(m => m.Genres)
            .HasColumnName("genres")
            .HasColumnType("jsonb");

        builder.Property(m => m.Runtime)
            .HasColumnName("runtime");

        builder.Property(m => m.TmdbVoteAverage)
            .HasColumnName("tmdb_vote_average")
            .HasPrecision(3, 1);

        builder.Property(m => m.TmdbVoteCount)
            .HasColumnName("tmdb_vote_count");

        builder.Property(m => m.Popularity)
            .HasColumnName("popularity")
            .HasPrecision(8, 3);

        builder.Property(m => m.OriginalLanguage)
            .HasColumnName("original_language")
            .HasMaxLength(10);

        builder.Property(m => m.ProductionCountries)
            .HasColumnName("production_countries")
            .HasColumnType("jsonb");

        builder.Property(m => m.ImdbId)
            .HasColumnName("imdb_id")
            .HasMaxLength(15);

        builder.Property(m => m.Adult)
            .HasColumnName("adult")
            .HasDefaultValue(false);

        builder.Property(m => m.Budget)
            .HasColumnName("budget");

        builder.Property(m => m.Revenue)
            .HasColumnName("revenue");

        builder.Property(m => m.Tagline)
            .HasColumnName("tagline")
            .HasColumnType("text");  // No length limit for taglines

        builder.Property(m => m.Homepage)
            .HasColumnName("homepage")
            .HasMaxLength(2000);  // Increased for long URLs

        builder.Property(m => m.Status)
            .HasColumnName("status")
            .HasMaxLength(50);

        builder.Property(m => m.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(m => m.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Indexes
        builder.HasIndex(m => m.TmdbId)
            .IsUnique()
            .HasDatabaseName("IX_Media_TmdbId");

        builder.HasIndex(m => m.MediaType)
            .HasDatabaseName("IX_Media_MediaType");

        builder.HasIndex(m => m.ImdbId)
            .HasDatabaseName("IX_Media_ImdbId");

        builder.HasIndex(m => m.Popularity)
            .IsDescending()
            .HasDatabaseName("IX_Media_Popularity");

        // Full-text search index for title
        builder.HasIndex(m => m.Title)
            .HasDatabaseName("IX_Media_Title_FullText");

        // Composite indexes for performance
        builder.HasIndex(m => new { m.MediaType, m.Popularity })
            .HasDatabaseName("IX_Media_MediaType_Popularity");

        builder.HasIndex(m => new { m.MediaType, m.ReleaseDate })
            .HasDatabaseName("IX_Media_MediaType_ReleaseDate");

        // Relationships
        builder.HasMany(m => m.UserRatings)
            .WithOne(r => r.Media)
            .HasForeignKey(r => r.MediaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
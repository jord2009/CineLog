using CineLog.Core.DTOs.External;
using CineLog.Core.Entities;
using CineLog.Core.Exceptions;
using CineLog.Core.Interfaces.Common;
using CineLog.Core.Interfaces.External;
using CineLog.Core.Interfaces.Services;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CineLog.Core.Services;

public class MediaService : IMediaService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITmdbApiService _tmdbApiService;
    private readonly ILogger<MediaService> _logger;

    public MediaService(
        IUnitOfWork unitOfWork,
        ITmdbApiService tmdbApiService,
        ILogger<MediaService> logger)
    {
        _unitOfWork = unitOfWork;
        _tmdbApiService = tmdbApiService;
        _logger = logger;
    }

    public async Task<Media> GetOrCreateMediaFromTmdbAsync(int tmdbId, string mediaTypeString, CancellationToken cancellationToken = default)
    {
        // Parse media type
        if (!Enum.TryParse<MediaType>(mediaTypeString, true, out var mediaType))
        {
            throw new DomainException($"Invalid media type: {mediaTypeString}");
        }

        // Check if media already exists in our database
        var existingMedia = await _unitOfWork.Media.FirstOrDefaultAsync(
            m => m.TmdbId == tmdbId && m.MediaType == mediaType,
            cancellationToken);

        if (existingMedia != null)
        {
            _logger.LogInformation("Media found in database: {Title} (TMDb ID: {TmdbId})", existingMedia.Title, tmdbId);
            return existingMedia;
        }

        // Fetch from TMDb API
        _logger.LogInformation("Fetching media from TMDb API: ID {TmdbId}, Type {MediaType}", tmdbId, mediaType);

        Media newMedia;

        if (mediaType == MediaType.Movie)
        {
            var tmdbMovie = await _tmdbApiService.GetMovieDetailsAsync(tmdbId, cancellationToken);
            newMedia = CreateMediaFromTmdbMovie(tmdbMovie, tmdbId);
        }
        else
        {
            // For now, we'll create a basic TV show entry
            // In the future, we can add a GetTvDetailsAsync method to ITmdbApiService
            throw new NotImplementedException("TV show support coming soon!");
        }

        // Save to database
        await _unitOfWork.Media.AddAsync(newMedia, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created new media in database: {Title} (TMDb ID: {TmdbId})", newMedia.Title, tmdbId);

        return newMedia;
    }

    private static Media CreateMediaFromTmdbMovie(TmdbMovieDetails tmdbMovie, int tmdbId)
    {
        var media = Media.CreateFromTmdb(tmdbId, MediaType.Movie, tmdbMovie.Title ?? "Unknown Title");

        // Parse release date
        DateTime? releaseDate = null;
        if (!string.IsNullOrEmpty(tmdbMovie.ReleaseDate) && DateTime.TryParse(tmdbMovie.ReleaseDate, out var parsedDate))
        {
            releaseDate = parsedDate;
        }

        // Serialize genres
        var genresJson = tmdbMovie.Genres.Any()
            ? JsonSerializer.Serialize(tmdbMovie.Genres.Select(g => new { g.Id, g.Name }))
            : null;

        // Serialize production countries
        var countriesJson = tmdbMovie.ProductionCountries.Any()
            ? JsonSerializer.Serialize(tmdbMovie.ProductionCountries.Select(c => new { c.Iso31661, c.Name }))
            : null;

        media.UpdateFromTmdbData(
            title: tmdbMovie.Title ?? "Unknown Title",
            originalTitle: tmdbMovie.OriginalTitle,
            overview: tmdbMovie.Overview,
            releaseDate: releaseDate,
            posterPath: tmdbMovie.PosterPath,
            backdropPath: tmdbMovie.BackdropPath,
            genres: genresJson,
            runtime: tmdbMovie.Runtime,
            voteAverage: tmdbMovie.VoteAverage,
            voteCount: tmdbMovie.VoteCount,
            popularity: tmdbMovie.Popularity,
            originalLanguage: tmdbMovie.OriginalLanguage,
            productionCountries: countriesJson,
            imdbId: tmdbMovie.ImdbId,
            adult: tmdbMovie.Adult,
            budget: tmdbMovie.Budget,
            revenue: tmdbMovie.Revenue,
            tagline: tmdbMovie.Tagline,
            homepage: tmdbMovie.Homepage,
            status: tmdbMovie.Status
        );

        return media;
    }
}

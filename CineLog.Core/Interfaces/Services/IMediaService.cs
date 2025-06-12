using CineLog.Core.Entities;

namespace CineLog.Core.Interfaces.Services;

public interface IMediaService
{
    Task<Media> GetOrCreateMediaFromTmdbAsync(int tmdbId, string mediaType, CancellationToken cancellationToken = default);
}
using System.Text.Json.Serialization;

namespace CineLog.Core.DTOs.External;

public class TmdbConfiguration
{
    [JsonPropertyName("images")]
    public TmdbImageConfiguration Images { get; set; } = null!;
}

public class TmdbImageConfiguration
{
    [JsonPropertyName("base_url")]
    public string BaseUrl { get; set; } = string.Empty;

    [JsonPropertyName("secure_base_url")]
    public string SecureBaseUrl { get; set; } = string.Empty;

    [JsonPropertyName("backdrop_sizes")]
    public List<string> BackdropSizes { get; set; } = new();

    [JsonPropertyName("poster_sizes")]
    public List<string> PosterSizes { get; set; } = new();
}

public class TmdbSearchResponse
{
    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("results")]
    public List<TmdbMediaItem> Results { get; set; } = new();

    [JsonPropertyName("total_pages")]
    public int TotalPages { get; set; }

    [JsonPropertyName("total_results")]
    public int TotalResults { get; set; }
}

public class TmdbMediaItem
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("original_title")]
    public string? OriginalTitle { get; set; }

    [JsonPropertyName("original_name")]
    public string? OriginalName { get; set; }

    [JsonPropertyName("overview")]
    public string? Overview { get; set; }

    [JsonPropertyName("release_date")]
    public string? ReleaseDate { get; set; }

    [JsonPropertyName("first_air_date")]
    public string? FirstAirDate { get; set; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("backdrop_path")]
    public string? BackdropPath { get; set; }

    [JsonPropertyName("vote_average")]
    public decimal VoteAverage { get; set; }

    [JsonPropertyName("vote_count")]
    public int VoteCount { get; set; }

    [JsonPropertyName("popularity")]
    public decimal Popularity { get; set; }

    [JsonPropertyName("genre_ids")]
    public List<int> GenreIds { get; set; } = new();

    [JsonPropertyName("adult")]
    public bool Adult { get; set; }

    [JsonPropertyName("original_language")]
    public string? OriginalLanguage { get; set; }

    [JsonPropertyName("media_type")]
    public string? MediaType { get; set; }
}

public class TmdbMovieDetails : TmdbMediaItem
{
    [JsonPropertyName("imdb_id")]
    public string? ImdbId { get; set; }

    [JsonPropertyName("runtime")]
    public int? Runtime { get; set; }

    [JsonPropertyName("budget")]
    public long Budget { get; set; }

    [JsonPropertyName("revenue")]
    public long Revenue { get; set; }

    [JsonPropertyName("genres")]
    public List<TmdbGenre> Genres { get; set; } = new();

    [JsonPropertyName("production_countries")]
    public List<TmdbProductionCountry> ProductionCountries { get; set; } = new();

    [JsonPropertyName("tagline")]
    public string? Tagline { get; set; }

    [JsonPropertyName("homepage")]
    public string? Homepage { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }
}

public class TmdbTvDetails : TmdbMediaItem
{
    [JsonPropertyName("number_of_episodes")]
    public int? NumberOfEpisodes { get; set; }

    [JsonPropertyName("number_of_seasons")]
    public int? NumberOfSeasons { get; set; }

    [JsonPropertyName("last_air_date")]
    public string? LastAirDate { get; set; }

    [JsonPropertyName("genres")]
    public List<TmdbGenre> Genres { get; set; } = new();

    [JsonPropertyName("production_countries")]
    public List<TmdbProductionCountry> ProductionCountries { get; set; } = new();

    [JsonPropertyName("tagline")]
    public string? Tagline { get; set; }

    [JsonPropertyName("homepage")]
    public string? Homepage { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("in_production")]
    public bool InProduction { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }
}

public class TmdbGenre
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class TmdbProductionCountry
{
    [JsonPropertyName("iso_3166_1")]
    public string Iso31661 { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}
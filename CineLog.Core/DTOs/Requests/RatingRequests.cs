using System.ComponentModel.DataAnnotations;

namespace CineLog.Core.DTOs.Requests;

public class CreateRatingRequest
{
    [Required]
    public int TmdbId { get; set; }

    [Required]
    public string MediaType { get; set; } = "movie"; // "movie" or "tv"

    [Required]
    [Range(0.5, 10.0, ErrorMessage = "Rating must be between 0.5 and 10.0")]
    public decimal Rating { get; set; }

    [StringLength(2000, ErrorMessage = "Review cannot exceed 2000 characters")]
    public string? Review { get; set; }

    public bool IsSpoiler { get; set; } = false;
}

public class UpdateRatingRequest
{
    [Required]
    [Range(0.5, 10.0, ErrorMessage = "Rating must be between 0.5 and 10.0")]
    public decimal Rating { get; set; }

    [StringLength(2000, ErrorMessage = "Review cannot exceed 2000 characters")]
    public string? Review { get; set; }

    public bool IsSpoiler { get; set; } = false;
}
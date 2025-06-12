using CineLog.Core.DTOs.Requests;
using CineLog.Core.Exceptions;
using CineLog.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RatingsController : ControllerBase
{
    private readonly IRatingService _ratingService;
    private readonly ILogger<RatingsController> _logger;

    public RatingsController(IRatingService ratingService, ILogger<RatingsController> logger)
    {
        _ratingService = ratingService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrUpdateRating(CreateRatingRequest request)
    {
        try
        {
            var result = await _ratingService.CreateOrUpdateRatingAsync(request);
            return Ok(result);
        }
        catch (DomainException ex)
        {
            _logger.LogWarning("Rating creation failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating rating for TMDb ID {TmdbId}", request.TmdbId);
            return StatusCode(500, new { message = "An error occurred while saving your rating" });
        }
    }

    [HttpGet("my-ratings")]
    public async Task<IActionResult> GetMyRatings([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var ratings = await _ratingService.GetUserRatingsAsync(null, page, pageSize);
            return Ok(ratings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user ratings");
            return StatusCode(500, new { message = "An error occurred while retrieving your ratings" });
        }
    }

    [HttpGet("media/{tmdbId}/{mediaType}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMediaRatingStats(int tmdbId, string mediaType)
    {
        try
        {
            var stats = await _ratingService.GetMediaRatingStatsAsync(tmdbId, mediaType);
            return Ok(stats);
        }
        catch (DomainException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rating stats for TMDb ID {TmdbId}", tmdbId);
            return StatusCode(500, new { message = "An error occurred while retrieving rating statistics" });
        }
    }

    [HttpGet("my-rating/{tmdbId}/{mediaType}")]
    public async Task<IActionResult> GetMyRatingForMedia(int tmdbId, string mediaType)
    {
        try
        {
            var rating = await _ratingService.GetUserRatingForMediaAsync(tmdbId, mediaType);

            if (rating == null)
            {
                return NotFound(new { message = "You haven't rated this media yet" });
            }

            return Ok(rating);
        }
        catch (DomainException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user rating for TMDb ID {TmdbId}", tmdbId);
            return StatusCode(500, new { message = "An error occurred while retrieving your rating" });
        }
    }

    [HttpDelete("{ratingId}")]
    public async Task<IActionResult> DeleteRating(Guid ratingId)
    {
        try
        {
            var deleted = await _ratingService.DeleteRatingAsync(ratingId);

            if (!deleted)
            {
                return NotFound(new { message = "Rating not found" });
            }

            return Ok(new { message = "Rating deleted successfully" });
        }
        catch (DomainException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting rating {RatingId}", ratingId);
            return StatusCode(500, new { message = "An error occurred while deleting the rating" });
        }
    }
}
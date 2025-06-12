using CineLog.Core.Interfaces.External;
using Microsoft.AspNetCore.Mvc;

namespace CineLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TvShowsController : ControllerBase
{
    private readonly ITmdbApiService _tmdbService;
    private readonly ILogger<TvShowsController> _logger;

    public TvShowsController(ITmdbApiService tmdbService, ILogger<TvShowsController> logger)
    {
        _tmdbService = tmdbService;
        _logger = logger;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchTvShows([FromQuery] string query, [FromQuery] int page = 1)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Search query is required");
        }

        try
        {
            var result = await _tmdbService.SearchTvShowsAsync(query, page);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching TV shows with query: {Query}", query);
            return StatusCode(500, "An error occurred while searching TV shows");
        }
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending([FromQuery] string timeWindow = "week")
    {
        try
        {
            var result = await _tmdbService.GetTrendingAsync("tv", timeWindow);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trending TV shows");
            return StatusCode(500, "An error occurred while getting trending TV shows");
        }
    }
}
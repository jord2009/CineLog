using CineLog.Core.Interfaces.External;
using Microsoft.AspNetCore.Mvc;

namespace CineLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly ITmdbApiService _tmdbService;
    private readonly ILogger<MoviesController> _logger;

    public MoviesController(ITmdbApiService tmdbService, ILogger<MoviesController> logger)
    {
        _tmdbService = tmdbService;
        _logger = logger;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchMovies([FromQuery] string query, [FromQuery] int page = 1)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Search query is required");
        }

        try
        {
            var result = await _tmdbService.SearchMoviesAsync(query, page);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching movies with query: {Query}", query);
            return StatusCode(500, "An error occurred while searching movies");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMovieDetails(int id)
    {
        try
        {
            var result = await _tmdbService.GetMovieDetailsAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting movie details for ID: {Id}", id);
            return StatusCode(500, "An error occurred while getting movie details");
        }
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending([FromQuery] string timeWindow = "week")
    {
        try
        {
            var result = await _tmdbService.GetTrendingAsync("movie", timeWindow);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trending movies");
            return StatusCode(500, "An error occurred while getting trending movies");
        }
    }

    [HttpGet("discover")]
    public async Task<IActionResult> DiscoverMovies([FromQuery] int? year, [FromQuery] string? genre, [FromQuery] int page = 1)
    {
        try
        {
            var result = await _tmdbService.DiscoverMoviesAsync(year, genre, page);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error discovering movies");
            return StatusCode(500, "An error occurred while discovering movies");
        }
    }
}
using CineLog.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CineLog.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly CineLogDbContext _context;

    public UsersController(CineLogDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new { u.Id, u.Username, u.Email, u.CreatedAt })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("count")]
    public async Task<IActionResult> GetUserCount()
    {
        var count = await _context.Users.CountAsync();
        return Ok(new { userCount = count });
    }
}
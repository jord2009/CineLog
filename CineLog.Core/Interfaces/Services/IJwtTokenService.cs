using CineLog.Core.Entities;

namespace CineLog.Core.Interfaces.Services;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    bool ValidateToken(string token);
    Guid GetUserIdFromToken(string token);
    DateTime GetTokenExpiration(string token);
}
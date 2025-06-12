using CineLog.Core.DTOs.Requests;
using CineLog.Core.DTOs.Responses;

namespace CineLog.Core.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default);

}
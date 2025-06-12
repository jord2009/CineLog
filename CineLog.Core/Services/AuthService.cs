using CineLog.Core.DTOs.Requests;
using CineLog.Core.DTOs.Responses;
using CineLog.Core.Entities;
using CineLog.Core.Exceptions;
using CineLog.Core.Interfaces.Common;
using CineLog.Core.Interfaces.Services;

namespace CineLog.Core.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ICurrentUserService _currentUserService;

    public AuthService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _currentUserService = currentUserService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        // Check if user already exists
        if (await _unitOfWork.Users.AnyAsync(u => u.Email == request.Email.ToLowerInvariant(), cancellationToken))
        {
            throw new DomainException("User with this email already exists");
        }

        if (await _unitOfWork.Users.AnyAsync(u => u.Username == request.Username, cancellationToken))
        {
            throw new DomainException("Username is already taken");
        }

        // Hash password
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        // Create user entity
        var user = User.Create(
            request.Username,
            request.Email,
            passwordHash,
            request.FirstName,
            request.LastName);

        // Save to database
        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = _jwtTokenService.GetTokenExpiration(accessToken),
            User = MapToUserResponse(user)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        // Find user by email
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(
            u => u.Email == request.Email.ToLowerInvariant(),
            cancellationToken);

        if (user == null)
        {
            throw new DomainException("Invalid email or password");
        }

        // Verify password
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new DomainException("Invalid email or password");
        }

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = _jwtTokenService.GetTokenExpiration(accessToken),
            User = MapToUserResponse(user)
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        // For simplicity, we're not storing refresh tokens in this implementation
        // In production, you'd want to store and validate refresh tokens
        throw new NotImplementedException("Refresh token functionality not implemented yet");
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        // For JWT tokens, logout is typically handled client-side by deleting the token
        // In production with refresh tokens, you'd invalidate the refresh token here
        await Task.CompletedTask;
    }

    public async Task<bool> ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.GetUserId();
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);

        if (user == null)
        {
            throw new DomainException("User not found");
        }

        // Verify current password
        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new DomainException("Current password is incorrect");
        }

        // Hash new password and update
        var newPasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.ChangePassword(newPasswordHash);

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static UserResponse MapToUserResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            IsEmailVerified = user.IsEmailVerified,
            CreatedAt = user.CreatedAt
        };
    }
}

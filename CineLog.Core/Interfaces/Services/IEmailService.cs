namespace CineLog.Core.Interfaces.Services;

public interface IEmailService
{
    Task SendEmailVerificationAsync(string email, string verificationToken, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(string email, string resetToken, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string email, string username, CancellationToken cancellationToken = default);
}
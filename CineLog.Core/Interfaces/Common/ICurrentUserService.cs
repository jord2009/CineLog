namespace CineLog.Core.Interfaces.Common;

public interface ICurrentUserService
{
    Guid GetUserId();
    string GetUserEmail();
    bool IsAuthenticated();
}
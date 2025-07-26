using OPMarketplace.Models; // 🔄 ЗМІНИТИ NAMESPACE

namespace OPMarketplace.Services // 🔄 ЗМІНИТИ NAMESPACE
{
    public interface IUserService
    {
        Task<User> GetUserByIdAsync(Guid id);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> GetUserByUsernameAsync(string username);
        Task<User> CreateUserAsync(User user);
        Task<User> UpdateUserAsync(User user);
    }
}

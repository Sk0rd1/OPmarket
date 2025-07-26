using Npgsql;
using Dapper;
using OPMarketplace.Models; // 🔄 ЗМІНИТИ NAMESPACE

namespace OPMarketplace.Services // 🔄 ЗМІНИТИ NAMESPACE
{
    public class UserService : IUserService
    {
        private readonly string _connectionString;

        public UserService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<User> GetUserByIdAsync(Guid id)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = "SELECT * FROM users WHERE id = @Id";
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = "SELECT * FROM users WHERE email = @Email";
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = "SELECT * FROM users WHERE username = @Username";
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
        }

        public async Task<User> CreateUserAsync(User user)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                INSERT INTO users (username, email, password_hash, seller_rating, total_sales, is_verified_seller, seller_since, created_at, updated_at)
                VALUES (@Username, @Email, @PasswordHash, @SellerRating, @TotalSales, @IsVerifiedSeller, @SellerSince, @CreatedAt, @UpdatedAt)
                RETURNING *";
            
            return await connection.QueryFirstAsync<User>(sql, user);
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                UPDATE users 
                SET username = @Username, email = @Email, updated_at = @UpdatedAt
                WHERE id = @Id
                RETURNING *";
            
            return await connection.QueryFirstAsync<User>(sql, user);
        }
    }
}

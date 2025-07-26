using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using OPMarketplace.Models;  // 🔄 ЗМІНИТИ NAMESPACE
using OPMarketplace.Services; // 🔄 ДОДАТИ NAMESPACE

namespace OPMarketplace.Controllers // 🔄 ЗМІНИТИ NAMESPACE
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;

        public AuthController(IUserService userService, IConfiguration configuration)
        {
            _userService = userService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Валідація
                if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "All fields are required" });
                }

                if (request.Password.Length < 6)
                {
                    return BadRequest(new { message = "Password must be at least 6 characters long" });
                }

                // Перевірка чи існує користувач
                var existingUser = await _userService.GetUserByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "User with this email already exists" });
                }

                var existingUsername = await _userService.GetUserByUsernameAsync(request.Username);
                if (existingUsername != null)
                {
                    return BadRequest(new { message = "Username is already taken" });
                }

                // Хешування пароля
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Створення користувача
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = hashedPassword,
                    SellerRating = 0.00m,
                    TotalSales = 0,
                    IsVerifiedSeller = false,
                    SellerSince = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdUser = await _userService.CreateUserAsync(user);

                // Генерація JWT токену
                var token = GenerateJwtToken(createdUser);

                return Ok(new
                {
                    token = token,
                    user = new
                    {
                        id = createdUser.Id.ToString(),
                        username = createdUser.Username,
                        email = createdUser.Email,
                        seller_rating = createdUser.SellerRating,
                        total_sales = createdUser.TotalSales,
                        is_verified_seller = createdUser.IsVerifiedSeller,
                        seller_since = createdUser.SellerSince,
                        created_at = createdUser.CreatedAt,
                        updated_at = createdUser.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Валідація
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                // Пошук користувача
                var user = await _userService.GetUserByEmailAsync(request.Email);
                if (user == null)
                {
                    return BadRequest(new { message = "Invalid email or password" });
                }

                // Перевірка пароля
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return BadRequest(new { message = "Invalid email or password" });
                }

                // Генерація JWT токену
                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    token = token,
                    user = new
                    {
                        id = user.Id.ToString(),
                        username = user.Username,
                        email = user.Email,
                        seller_rating = user.SellerRating,
                        total_sales = user.TotalSales,
                        is_verified_seller = user.IsVerifiedSeller,
                        seller_since = user.SellerSince,
                        created_at = user.CreatedAt,
                        updated_at = user.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateToken()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var user = await _userService.GetUserByIdAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                return Ok(new
                {
                    id = user.Id.ToString(),
                    username = user.Username,
                    email = user.Email,
                    seller_rating = user.SellerRating,
                    total_sales = user.TotalSales,
                    is_verified_seller = user.IsVerifiedSeller,
                    seller_since = user.SellerSince,
                    created_at = user.CreatedAt,
                    updated_at = user.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expirationDays = int.Parse(jwtSettings["ExpirationDays"]);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(expirationDays),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

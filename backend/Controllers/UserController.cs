using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using OPMarketplace.Models;  // 🔄 ЗМІНИТИ NAMESPACE
using OPMarketplace.Services; // 🔄 ДОДАТИ NAMESPACE

namespace OPMarketplace.Controllers // 🔄 ЗМІНИТИ NAMESPACE
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
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
                    return NotFound(new { message = "User not found" });
                }

                // Валідація
                if (!string.IsNullOrEmpty(request.Username))
                {
                    if (request.Username.Length < 3)
                    {
                        return BadRequest(new { message = "Username must be at least 3 characters long" });
                    }

                    // Перевірка унікальності username
                    var existingUser = await _userService.GetUserByUsernameAsync(request.Username);
                    if (existingUser != null && existingUser.Id != user.Id)
                    {
                        return BadRequest(new { message = "Username is already taken" });
                    }

                    user.Username = request.Username;
                }

                if (!string.IsNullOrEmpty(request.Email))
                {
                    // Перевірка унікальності email
                    var existingUser = await _userService.GetUserByEmailAsync(request.Email);
                    if (existingUser != null && existingUser.Id != user.Id)
                    {
                        return BadRequest(new { message = "Email is already taken" });
                    }

                    user.Email = request.Email;
                }

                user.UpdatedAt = DateTime.UtcNow;

                var updatedUser = await _userService.UpdateUserAsync(user);

                return Ok(new
                {
                    id = updatedUser.Id.ToString(),
                    username = updatedUser.Username,
                    email = updatedUser.Email,
                    seller_rating = updatedUser.SellerRating,
                    total_sales = updatedUser.TotalSales,
                    is_verified_seller = updatedUser.IsVerifiedSeller,
                    seller_since = updatedUser.SellerSince,
                    created_at = updatedUser.CreatedAt,
                    updated_at = updatedUser.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}

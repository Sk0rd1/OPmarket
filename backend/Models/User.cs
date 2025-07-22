using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OPMarketplace.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("username")]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Column("email")]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Column("password_hash")]
        [StringLength(255)]
        public string? PasswordHash { get; set; }

        [Column("seller_rating")]
        public decimal SellerRating { get; set; } = 0.00m;

        [Column("total_sales")]
        public int TotalSales { get; set; } = 0;

        [Column("is_verified_seller")]
        public bool IsVerifiedSeller { get; set; } = false;

        [Column("seller_since")]
        public DateTime SellerSince { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OPMarketplace.Models
{
    [Table("listings")]
    public class Listing
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("product_id")]
        public Guid ProductId { get; set; }

        [Column("seller_id")]
        public Guid SellerId { get; set; }

        [Column("condition_code")]
        [StringLength(10)]
        public string ConditionCode { get; set; } = string.Empty;

        [Column("price")]
        public decimal Price { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; } = 1;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("ProductId")]
        public virtual Card Card { get; set; } = null!;

        [ForeignKey("SellerId")]
        public virtual User Seller { get; set; } = null!;

        [ForeignKey("ConditionCode")]
        public virtual CardCondition CardCondition { get; set; } = null!;
    }
}

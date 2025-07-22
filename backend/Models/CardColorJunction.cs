using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OPMarketplace.Models
{
    [Table("card_colors_junction")]
    public class CardColorJunction
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("product_id")]
        public Guid ProductId { get; set; }

        [Column("color_code")]
        [StringLength(20)]
        public string ColorCode { get; set; } = string.Empty;

        [Column("is_primary")]
        public bool IsPrimary { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        [ForeignKey("ProductId")]
        public virtual Card Card { get; set; } = null!;

        [ForeignKey("ColorCode")]
        public virtual CardColor CardColor { get; set; } = null!;
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OPMarketplace.Models
{
    [Table("cards")]
    public class Card
    {
        [Key]
        [Column("product_id")]
        public Guid ProductId { get; set; }

        [Column("base_card_id")]
        [StringLength(20)]
        public string BaseCardId { get; set; } = string.Empty;

        // 🆕 Додане поле ShortCode
        [Column("shortcode")]
        [StringLength(20)]
        public string ShortCode { get; set; } = string.Empty;

        [Column("name")]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("card_type_detail")]
        [StringLength(100)]
        public string? CardTypeDetail { get; set; }

        [Column("effect")]
        public string? Effect { get; set; }

        [Column("power")]
        public int? Power { get; set; }

        [Column("cost")]
        public int? Cost { get; set; }

        [Column("life")]
        public int? Life { get; set; }

        [Column("counter")]
        public int? Counter { get; set; }

        [Column("attribute")]
        [StringLength(50)]
        public string? Attribute { get; set; }

        [Column("rarity")]
        [StringLength(10)]
        public string? Rarity { get; set; }

        [Column("set_code")]
        [StringLength(20)]
        public string? SetCode { get; set; }

        [Column("collector_number")]
        [StringLength(10)]
        public string? CollectorNumber { get; set; }

        [Column("artist")]
        [StringLength(100)]
        public string? Artist { get; set; }

        [Column("image_url")]
        [StringLength(500)]
        public string? ImageUrl { get; set; }

        [Column("language")]
        [StringLength(5)]
        public string Language { get; set; } = "EN";

        [Column("is_alternate_art")]
        public bool IsAlternateArt { get; set; } = false;

        [Column("series_id")]
        [StringLength(20)]
        public string? SeriesId { get; set; }

        [Column("series_name")]
        [StringLength(200)]
        public string? SeriesName { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<CardColorJunction> CardColors { get; set; } = new List<CardColorJunction>();
        public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();
    }
}

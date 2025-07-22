using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OPMarketplace.Models
{
    [Table("card_colors")]
    public class CardColor
    {
        [Key]
        [Column("code")]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;

        [Column("name")]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        [Column("hex_color")]
        [StringLength(7)]
        public string? HexColor { get; set; }

        // Navigation properties
        public virtual ICollection<CardColorJunction> CardColorJunctions { get; set; } = new List<CardColorJunction>();
    }
}

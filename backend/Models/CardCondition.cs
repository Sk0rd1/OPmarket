using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OPMarketplace.Models
{
    [Table("card_conditions")]
    public class CardCondition
    {
        [Key]
        [Column("code")]
        [StringLength(10)]
        public string Code { get; set; } = string.Empty;

        [Column("name")]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("sort_order")]
        public int SortOrder { get; set; } = 0;

        // Navigation properties
        public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();
    }
}

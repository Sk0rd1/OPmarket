namespace OPMarketplace.DTOs
{
    public class CardDto
    {
        public Guid ProductId { get; set; }
        public string BaseCardId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? CardTypeDetail { get; set; }
        public string? Effect { get; set; }
        public int? Power { get; set; }
        public int? Cost { get; set; }
        public int? Life { get; set; }
        public int? Counter { get; set; }
        public string? Attribute { get; set; }
        public string? Rarity { get; set; }
        public string? SetCode { get; set; }
        public string? Artist { get; set; }
        public string? ImageUrl { get; set; }
        public string Language { get; set; } = "EN";
        public bool IsAlternateArt { get; set; }
        public string? SeriesName { get; set; }
        public List<CardColorDto> Colors { get; set; } = new();
        public List<ListingDto> Listings { get; set; } = new();
        public decimal? MinPrice { get; set; }
        public int ListingCount { get; set; }
    }

    public class CardColorDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? HexColor { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ListingDto
    {
        public Guid Id { get; set; }
        public string ConditionCode { get; set; } = string.Empty;
        public string ConditionName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? Description { get; set; }
        public string SellerUsername { get; set; } = string.Empty;
        public decimal SellerRating { get; set; }
        public bool IsVerifiedSeller { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

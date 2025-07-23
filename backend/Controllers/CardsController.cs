using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OPMarketplace.Data;
using OPMarketplace.DTOs;
using System.ComponentModel.DataAnnotations;

namespace OPMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("ApiPolicy")]
    public class CardsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CardsController> _logger;

        // Константи для валідації
        private const int MAX_PAGE_SIZE = 100;
        private const int MAX_SEARCH_LENGTH = 100;
        private const double MAX_PRICE = 10000.0;
        private const int MAX_POWER = 50000;

        // Валідні значення для фільтрів
        private static readonly HashSet<string> ValidRarities = new() { "C", "UC", "R", "SR", "SEC", "L", "P" };
        private static readonly HashSet<string> ValidColors = new() { "Red", "Blue", "Green", "Yellow", "Purple", "Black", "Multicolor" };
        private static readonly HashSet<string> ValidTypes = new() { "CHARACTER", "EVENT", "STAGE", "DON", "LEADER" };
        private static readonly HashSet<string> ValidAttributes = new() { "Strike", "Slash", "Ranged", "Special" };
        private static readonly HashSet<string> ValidSortOptions = new() { "name-asc", "name-desc", "price-low", "price-high", "rarity", "power-low", "power-high" };

        public CardsController(ApplicationDbContext context, ILogger<CardsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/cards
        [HttpGet]
        [EnableRateLimiting("SearchPolicy")]
        public async Task<ActionResult> GetCards(
            [FromQuery][Range(1, int.MaxValue)] int page = 1,
            [FromQuery][Range(1, MAX_PAGE_SIZE)] int limit = 20,
            [FromQuery][StringLength(MAX_SEARCH_LENGTH)] string? search = null,
            [FromQuery] string[]? colors = null,
            [FromQuery] string[]? rarities = null,
            [FromQuery] string? type = null,
            [FromQuery][StringLength(200)] string? series = null,
            [FromQuery][StringLength(50)] string? attribute = null,
            [FromQuery][Range(0.0, MAX_PRICE)] decimal? minPrice = null,
            [FromQuery][Range(0.0, MAX_PRICE)] decimal? maxPrice = null,
            [FromQuery][Range(0, MAX_POWER)] int? minPower = null,
            [FromQuery][Range(0, MAX_POWER)] int? maxPower = null,
            [FromQuery] string sortBy = "name-asc")
        {
            try
            {
                // Валідація та санітізація вхідних параметрів
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Валідація масивів фільтрів
                if (colors?.Any() == true && !colors.All(c => ValidColors.Contains(c)))
                {
                    return BadRequest("Invalid color filter values");
                }

                if (rarities?.Any() == true && !rarities.All(r => ValidRarities.Contains(r)))
                {
                    return BadRequest("Invalid rarity filter values");
                }

                if (!string.IsNullOrEmpty(type) && !ValidTypes.Contains(type))
                {
                    return BadRequest("Invalid type filter value");
                }

                if (!string.IsNullOrEmpty(attribute) && !ValidAttributes.Contains(attribute))
                {
                    return BadRequest("Invalid attribute filter value");
                }

                if (!ValidSortOptions.Contains(sortBy))
                {
                    sortBy = "name-asc"; // fallback
                }

                // Валідація діапазону цін
                if (minPrice.HasValue && maxPrice.HasValue && minPrice > maxPrice)
                {
                    return BadRequest("minPrice cannot be greater than maxPrice");
                }

                // Валідація діапазону power
                if (minPower.HasValue && maxPower.HasValue && minPower > maxPower)
                {
                    return BadRequest("minPower cannot be greater than maxPower");
                }

                // Санітізація search параметра
                if (!string.IsNullOrEmpty(search))
                {
                    search = search.Trim();
                    if (search.Length == 0) search = null;
                }

                // Початковий запит
                var query = _context.Cards
                    .Include(c => c.CardColors.Take(5))
                        .ThenInclude(cc => cc.CardColor)
                    .AsQueryable();

                // Фільтр пошуку по назві та ID карти
                if (!string.IsNullOrEmpty(search))
                {
                    var searchLower = search.ToLower();
                    query = query.Where(c => 
                        c.Name.ToLower().Contains(searchLower) ||
                        c.BaseCardId.ToLower().Contains(searchLower));
                }

                // Фільтр по кольорам
                if (colors?.Any() == true)
                {
                    query = query.Where(c => c.CardColors.Any(cc => colors.Contains(cc.ColorCode)));
                }

                // Фільтр по рідкості
                if (rarities?.Any() == true)
                {
                    query = query.Where(c => c.Rarity != null && rarities.Contains(c.Rarity));
                }

                // Фільтр по типу
                if (!string.IsNullOrEmpty(type))
                {
                    query = query.Where(c => c.CardTypeDetail == type);
                }

                // Фільтр по серії
                if (!string.IsNullOrEmpty(series))
                {
                    query = query.Where(c => c.SeriesName == series);
                }

                // Фільтр по атрибуту
                if (!string.IsNullOrEmpty(attribute))
                {
                    query = query.Where(c => c.Attribute == attribute);
                }

                // Фільтр по power
                if (minPower.HasValue)
                {
                    query = query.Where(c => c.Power >= minPower.Value);
                }

                if (maxPower.HasValue)
                {
                    query = query.Where(c => c.Power <= maxPower.Value);
                }

                // Фільтр по ціні через підзапит
                if (minPrice.HasValue || maxPrice.HasValue)
                {
                    var cardsWithPriceFilter = _context.Listings
                        .Where(l => l.IsActive &&
                            (!minPrice.HasValue || l.Price >= minPrice.Value) &&
                            (!maxPrice.HasValue || l.Price <= maxPrice.Value))
                        .Select(l => l.ProductId)
                        .Distinct();

                    query = query.Where(c => cardsWithPriceFilter.Contains(c.ProductId));
                }

                // Тільки карти з активними лістингами
                query = query.Where(c => 
                    _context.Listings.Any(l => l.ProductId == c.ProductId && l.IsActive));

                // Сортування
                query = sortBy switch
                {
                    "name-desc" => query.OrderByDescending(c => c.Name),
                    "price-low" => query.OrderBy(c => 
                        _context.Listings
                            .Where(l => l.ProductId == c.ProductId && l.IsActive)
                            .Min(l => l.Price)),
                    "price-high" => query.OrderByDescending(c => 
                        _context.Listings
                            .Where(l => l.ProductId == c.ProductId && l.IsActive)
                            .Min(l => l.Price)),
                    "rarity" => query.OrderByDescending(c => 
                        c.Rarity == "SEC" ? 7 :
                        c.Rarity == "SR" ? 6 :
                        c.Rarity == "R" ? 5 :
                        c.Rarity == "UC" ? 4 :
                        c.Rarity == "C" ? 3 :
                        c.Rarity == "L" ? 2 :
                        c.Rarity == "P" ? 1 : 0),
                    "power-low" => query.OrderBy(c => c.Power ?? 0),
                    "power-high" => query.OrderByDescending(c => c.Power ?? 0),
                    _ => query.OrderBy(c => c.Name)
                };

                // Підрахунок загальної кількості
                var totalCount = await query.CountAsync();

                if (totalCount == 0)
                {
                    return Ok(new 
                    {
                        data = new List<CardDto>(),
                        totalCount = 0,
                        page = page,
                        limit = limit,
                        totalPages = 0
                    });
                }

                // Пагінація та отримання карт
                var cards = await query
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                // Формуємо DTO
                var cardDtos = new List<CardDto>();
                foreach (var card in cards)
                {
                    // Отримуємо активні лістинги для кожної карти
                    var cardListings = await _context.Listings
                        .Where(l => l.ProductId == card.ProductId && l.IsActive)
                        .Include(l => l.Seller)
                        .Include(l => l.CardCondition)
                        .OrderBy(l => l.Price)
                        .Take(10)
                        .ToListAsync();

                    var cardDto = new CardDto
                    {
                        ProductId = card.ProductId,
                        BaseCardId = card.BaseCardId,
                        Name = card.Name,
                        CardTypeDetail = card.CardTypeDetail,
                        Effect = card.Effect,
                        Power = card.Power,
                        Cost = card.Cost,
                        Life = card.Life,
                        Counter = card.Counter,
                        Attribute = card.Attribute,
                        Rarity = card.Rarity,
                        SetCode = card.SetCode,
                        Artist = card.Artist,
                        ImageUrl = card.ImageUrl,
                        Language = card.Language,
                        IsAlternateArt = card.IsAlternateArt,
                        SeriesName = card.SeriesName,
                        Colors = card.CardColors.Select(cc => new CardColorDto 
                        {
                            Code = cc.ColorCode,
                            Name = cc.CardColor.Name,
                            HexColor = cc.CardColor.HexColor,
                            IsPrimary = cc.IsPrimary
                        }).ToList(),
                        Listings = cardListings.Select(l => new ListingDto
                        {
                            Id = l.Id,
                            ConditionCode = l.ConditionCode,
                            ConditionName = l.CardCondition.Name,
                            Price = l.Price,
                            Quantity = l.Quantity,
                            Description = l.Description,
                            SellerUsername = l.Seller.Username,
                            SellerRating = l.Seller.SellerRating,
                            IsVerifiedSeller = l.Seller.IsVerifiedSeller,
                            CreatedAt = l.CreatedAt
                        }).ToList(),
                        MinPrice = cardListings.Any() ? cardListings.Min(l => l.Price) : (decimal?)null,
                        ListingCount = cardListings.Count
                    };

                    cardDtos.Add(cardDto);
                }

                var result = new 
                {
                    data = cardDtos,
                    totalCount = totalCount,
                    page = page,
                    limit = limit,
                    totalPages = (int)Math.Ceiling((double)totalCount / limit)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching cards with filters: page={Page}, limit={Limit}, search={Search}", 
                    page, limit, search);
                return StatusCode(500, new { Error = "Internal server error" });
            }
        }

        // GET: api/cards/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CardDto>> GetCard(Guid id)
        {
            try
            {
                var card = await _context.Cards
                    .Include(c => c.CardColors)
                        .ThenInclude(cc => cc.CardColor)
                    .Include(c => c.Listings.Where(l => l.IsActive))
                        .ThenInclude(l => l.Seller)
                    .Include(c => c.Listings.Where(l => l.IsActive))
                        .ThenInclude(l => l.CardCondition)
                    .FirstOrDefaultAsync(c => c.ProductId == id);

                if (card == null)
                    return NotFound();

                var cardDto = new CardDto
                {
                    ProductId = card.ProductId,
                    BaseCardId = card.BaseCardId,
                    Name = card.Name,
                    CardTypeDetail = card.CardTypeDetail,
                    Effect = card.Effect,
                    Power = card.Power,
                    Cost = card.Cost,
                    Life = card.Life,
                    Counter = card.Counter,
                    Attribute = card.Attribute,
                    Rarity = card.Rarity,
                    SetCode = card.SetCode,
                    Artist = card.Artist,
                    ImageUrl = card.ImageUrl,
                    Language = card.Language,
                    IsAlternateArt = card.IsAlternateArt,
                    SeriesName = card.SeriesName,
                    Colors = card.CardColors.Select(cc => new CardColorDto 
                    {
                        Code = cc.ColorCode,
                        Name = cc.CardColor.Name,
                        HexColor = cc.CardColor.HexColor,
                        IsPrimary = cc.IsPrimary
                    }).ToList(),
                    Listings = card.Listings.Where(l => l.IsActive).Select(l => new ListingDto
                    {
                        Id = l.Id,
                        ConditionCode = l.ConditionCode,
                        ConditionName = l.CardCondition.Name,
                        Price = l.Price,
                        Quantity = l.Quantity,
                        Description = l.Description,
                        SellerUsername = l.Seller.Username,
                        SellerRating = l.Seller.SellerRating,
                        IsVerifiedSeller = l.Seller.IsVerifiedSeller,
                        CreatedAt = l.CreatedAt
                    }).OrderBy(l => l.Price).ToList()
                };

                return Ok(cardDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching card {CardId}", id);
                return StatusCode(500, new { Error = "Internal server error" });
            }
        }

        // GET: api/cards/featured
        [HttpGet("featured")]
        [EnableRateLimiting("FeaturedPolicy")]
        public async Task<ActionResult> GetFeaturedCards([FromQuery][Range(1, 50)] int limit = 10)
        {
            try
            {
                var popularCards = await _context.Cards
                    .Include(c => c.CardColors)
                        .ThenInclude(cc => cc.CardColor)
                    .Where(c => _context.Listings.Any(l => l.ProductId == c.ProductId && l.IsActive))
                    .OrderByDescending(c => _context.Listings.Count(l => l.ProductId == c.ProductId && l.IsActive))
                    .ThenByDescending(c => c.Rarity == "SEC" ? 1 : c.Rarity == "SR" ? 2 : 3)
                    .Take(limit)
                    .ToListAsync();

                var cardDtos = new List<CardDto>();
                foreach (var card in popularCards)
                {
                    var minPrice = await _context.Listings
                        .Where(l => l.ProductId == card.ProductId && l.IsActive)
                        .MinAsync(l => l.Price);

                    var listingCount = await _context.Listings
                        .CountAsync(l => l.ProductId == card.ProductId && l.IsActive);

                    cardDtos.Add(new CardDto
                    {
                        ProductId = card.ProductId,
                        BaseCardId = card.BaseCardId,
                        Name = card.Name,
                        Rarity = card.Rarity,
                        ImageUrl = card.ImageUrl,
                        IsAlternateArt = card.IsAlternateArt,
                        SeriesName = card.SeriesName,
                        Colors = card.CardColors.Select(cc => new CardColorDto 
                        {
                            Code = cc.ColorCode,
                            Name = cc.CardColor.Name,
                            IsPrimary = cc.IsPrimary
                        }).ToList(),
                        MinPrice = minPrice,
                        ListingCount = listingCount
                    });
                }

                return Ok(cardDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching featured cards");
                return StatusCode(500, new { Error = "Internal server error" });
            }
        }
    }
}

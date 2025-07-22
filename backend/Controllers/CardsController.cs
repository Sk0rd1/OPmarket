using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OPMarketplace.Data;
using OPMarketplace.DTOs;

namespace OPMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CardsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CardsController> _logger;

        public CardsController(ApplicationDbContext context, ILogger<CardsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/cards
        [HttpGet]
        public async Task<ActionResult> GetCards(
            [FromQuery] int page = 1, 
            [FromQuery] int limit = 20,
            [FromQuery] string? search = null,
            [FromQuery] string[]? colors = null,
            [FromQuery] string[]? rarities = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null)
        {
            try
            {
                var query = _context.Cards
                    .Include(c => c.CardColors)
                        .ThenInclude(cc => cc.CardColor)
                    .Include(c => c.Listings.Where(l => l.IsActive))
                        .ThenInclude(l => l.Seller)
                    .Include(c => c.Listings.Where(l => l.IsActive))
                        .ThenInclude(l => l.CardCondition)
                    .AsQueryable();

                // Поиск по названию
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(c => c.Name.ToLower().Contains(search.ToLower()) ||
                                           c.BaseCardId.ToLower().Contains(search.ToLower()));
                }

                // Фильтр по цветам (OR логика)
                if (colors?.Any() == true)
                {
                    query = query.Where(c => c.CardColors.Any(cc => colors.Contains(cc.ColorCode)));
                }

                // Фильтр по редкости
                if (rarities?.Any() == true)
                {
                    query = query.Where(c => c.Rarity != null && rarities.Contains(c.Rarity));
                }

                // Фильтр по цене (только карты с активными листингами)
                if (minPrice.HasValue || maxPrice.HasValue)
                {
                    query = query.Where(c => c.Listings.Any(l => l.IsActive &&
                        (!minPrice.HasValue || l.Price >= minPrice.Value) &&
                        (!maxPrice.HasValue || l.Price <= maxPrice.Value)));
                }

                // Только карты с активными листингами
                query = query.Where(c => c.Listings.Any(l => l.IsActive));

                // Подсчет общего количества
                var totalCount = await query.CountAsync();

                // Пагинация
                var cards = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                var cardDtos = cards.Select(card => new CardDto
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
                    }).OrderBy(l => l.Price).ToList(),
                    MinPrice = card.Listings.Where(l => l.IsActive).Any() 
                        ? card.Listings.Where(l => l.IsActive).Min(l => l.Price) 
                        : (decimal?)null,
                    ListingCount = card.Listings.Count(l => l.IsActive)
                }).ToList();

                return Ok(new 
                {
                    data = cardDtos,
                    totalCount = totalCount,
                    page = page,
                    limit = limit,
                    totalPages = (int)Math.Ceiling((double)totalCount / limit)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching cards");
                return StatusCode(500, new { Error = "Internal server error", Message = ex.Message });
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
                return StatusCode(500, new { Error = "Internal server error", Message = ex.Message });
            }
        }

        // GET: api/cards/featured
        [HttpGet("featured")]
        public async Task<ActionResult> GetFeaturedCards([FromQuery] int limit = 10)
        {
            try
            {
                var popularCards = await _context.Cards
                    .Include(c => c.CardColors)
                        .ThenInclude(cc => cc.CardColor)
                    .Include(c => c.Listings.Where(l => l.IsActive))
                        .ThenInclude(l => l.Seller)
                    .Where(c => c.Listings.Any(l => l.IsActive))
                    .OrderByDescending(c => c.Listings.Count(l => l.IsActive))
                    .ThenByDescending(c => c.Rarity == "SEC" ? 1 : c.Rarity == "SR" ? 2 : 3)
                    .Take(limit)
                    .ToListAsync();

                var cardDtos = popularCards.Select(card => new CardDto
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
                    MinPrice = card.Listings.Where(l => l.IsActive).Min(l => l.Price),
                    ListingCount = card.Listings.Count(l => l.IsActive)
                }).ToList();

                return Ok(cardDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching featured cards");
                return StatusCode(500, new { Error = "Internal server error", Message = ex.Message });
            }
        }
    }
}

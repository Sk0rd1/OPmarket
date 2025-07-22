using Microsoft.EntityFrameworkCore;
using OPMarketplace.Data;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Налаштування для роботи з JSON
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Зберегти PascalCase
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Entity Framework + PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://192.168.31.78:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Health check endpoints
app.MapGet("/api/health", () => new { Status = "OK", Timestamp = DateTime.UtcNow });

app.MapGet("/api/test-db", async (ApplicationDbContext context) =>
{
    try
    {
        var cardCount = await context.Cards.CountAsync();
        var listingCount = await context.Listings.CountAsync();
        var userCount = await context.Users.CountAsync();
        
        return Results.Ok(new 
        { 
            Status = "Connected",
            Cards = cardCount,
            Listings = listingCount,
            Users = userCount,
            Timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Database connection failed: {ex.Message}");
    }
});

// Endpoint для карт
app.MapGet("/api/cards", async (ApplicationDbContext context,
    [FromQuery] int page = 1, 
    [FromQuery] int limit = 20,
    [FromQuery] string? search = null) =>
{
    try
    {
        var query = context.Cards.AsQueryable();

        // Пошук по назві
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Name.ToLower().Contains(search.ToLower()) ||
                                   c.BaseCardId.ToLower().Contains(search.ToLower()));
        }

        // Загальна кількість
        var totalCount = await query.CountAsync();

        // Пагінація
        var cards = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        // Конвертуємо в формат для фронтенду
        var cardDtos = cards.Select(card => new
        {
            productId = card.ProductId,
            baseCardId = card.BaseCardId,
            name = card.Name,
            cardTypeDetail = card.CardTypeDetail,
            effect = card.Effect,
            power = card.Power,
            cost = card.Cost,
            life = card.Life,
            counter = card.Counter,
            attribute = card.Attribute,
            rarity = card.Rarity ?? "C",
            setCode = card.SetCode,
            artist = card.Artist,
            imageUrl = card.ImageUrl,
            language = card.Language,
            isAlternateArt = card.IsAlternateArt,
            seriesName = card.SeriesName,
            colors = new[] { new { 
                code = "Red", 
                name = "Red", 
                hexColor = "#FF0000", 
                isPrimary = true 
            }}, // Mock colors для спрощення
            listings = new[] { new { 
                id = Guid.NewGuid(),
                conditionCode = "NM",
                conditionName = "Near Mint",
                price = 25.99m,
                quantity = 1,
                description = "Great condition",
                sellerUsername = "TestSeller",
                sellerRating = 4.5m,
                isVerifiedSeller = true,
                createdAt = DateTime.UtcNow
            }}, // Mock listings
            minPrice = 25.99m,
            listingCount = 1
        }).ToArray();

        return Results.Ok(new
        {
            data = cardDtos,  // ВАЖЛИВО: маленька літера
            totalCount = totalCount,
            page = page,
            limit = limit,
            totalPages = (int)Math.Ceiling((double)totalCount / limit)
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error fetching cards: {ex.Message}");
    }
});

// Featured cards endpoint
app.MapGet("/api/cards/featured", async (ApplicationDbContext context, [FromQuery] int limit = 10) =>
{
    try
    {
        var cards = await context.Cards
            .Where(c => c.Rarity == "SR" || c.Rarity == "SEC")
            .OrderByDescending(c => c.Rarity == "SEC" ? 1 : 0)
            .Take(limit)
            .ToListAsync();

        var cardDtos = cards.Select(card => new
        {
            productId = card.ProductId,
            baseCardId = card.BaseCardId,
            name = card.Name,
            rarity = card.Rarity,
            imageUrl = card.ImageUrl,
            isAlternateArt = card.IsAlternateArt,
            seriesName = card.SeriesName,
            colors = new[] { new { 
                code = "Red", 
                name = "Red", 
                isPrimary = true 
            }},
            minPrice = 45.99m,
            listingCount = 3
        }).ToArray();

        return Results.Ok(cardDtos);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error fetching featured cards: {ex.Message}");
    }
});

app.Run("http://0.0.0.0:5000");

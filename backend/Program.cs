using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer; // 🆕 JWT
using Microsoft.IdentityModel.Tokens; // 🆕 JWT
using System.Text; // 🆕 JWT
using OPMarketplace.Data;
using OPMarketplace.Services; // 🆕 UserService
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Налаштування для роботи з JSON
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Зберегти PascalCase
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.WriteIndented = builder.Environment.IsDevelopment();
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "One Piece TCG Marketplace API", 
        Version = "v1",
        Description = "API for One Piece Trading Card Game Marketplace"
    });
});

// 🆕 JWT Authentication configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]))
        };
    });

// 🆕 Register UserService for authentication
builder.Services.AddScoped<IUserService, UserService>();

// Entity Framework + PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    
    // Оптимізації для Entity Framework
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
    
    // Налаштування connection pool
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
});

// 🔄 CORS налаштування - додав AllowCredentials для JWT
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>() 
                            ?? new[] { "http://localhost:3000", "http://localhost:3001" };
        
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // 🆕 Для JWT tokens
    });
});

// Rate Limiting конфігурація
builder.Services.AddRateLimiter(options =>
{
    // Загальний ліміт для API
    options.AddFixedWindowLimiter("ApiPolicy", config =>
    {
        config.PermitLimit = 100; // 100 запитів за хвилину
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 10;
    });

    // Строгіший ліміт для пошуку
    options.AddFixedWindowLimiter("SearchPolicy", config =>
    {
        config.PermitLimit = 30; // 30 запитів за хвилину
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 5;
    });

    // Featured cards ліміт
    options.AddFixedWindowLimiter("FeaturedPolicy", config =>
    {
        config.PermitLimit = 60; // 60 запитів за хвилину
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 3;
    });

    // 🆕 Auth endpoints ліміт
    options.AddFixedWindowLimiter("AuthPolicy", config =>
    {
        config.PermitLimit = 20; // 20 спроб аутентифікації за хвилину
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 2;
    });

    // Глобальні налаштування по IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 200, // 200 запитів за хвилину на IP
                Window = TimeSpan.FromMinutes(1)
            }));

    // Обробка відхилених запитів
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        
        var response = new
        {
            error = "Too Many Requests",
            message = "Rate limit exceeded. Please try again later.",
            retryAfter = 60 // Default retry after 60 seconds
        };
        
        await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken: token);
    };
});

// Logging налаштування
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    
    if (builder.Environment.IsDevelopment())
    {
        logging.AddDebug();
        logging.SetMinimumLevel(LogLevel.Debug);
    }
    else
    {
        logging.SetMinimumLevel(LogLevel.Information);
    }
});

// Health checks (базові)
builder.Services.AddHealthChecks();

// Response compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "One Piece TCG Marketplace API v1");
        c.RoutePrefix = "swagger";
    });
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    
    await next();
});

app.UseResponseCompression();
app.UseCors("AllowFrontend");
app.UseRateLimiter();

// 🆕 Authentication middleware - ВАЖЛИВИЙ ПОРЯДОК!
app.UseAuthentication(); // Має бути перед UseAuthorization
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// API endpoints

// Health check endpoint з детальною інформацією
app.MapGet("/api/health", async (ApplicationDbContext context) =>
{
    try
    {
        var dbConnectionTime = System.Diagnostics.Stopwatch.StartNew();
        var cardCount = await context.Cards.CountAsync();
        dbConnectionTime.Stop();
        
        var listingCount = await context.Listings.CountAsync();
        var userCount = await context.Users.CountAsync();
        
        return Results.Ok(new 
        { 
            Status = "Healthy",
            Database = new
            {
                Status = "Connected",
                ResponseTime = $"{dbConnectionTime.ElapsedMilliseconds}ms",
                Cards = cardCount,
                Listings = listingCount,
                Users = userCount
            },
            Server = new
            {
                Environment = app.Environment.EnvironmentName,
                Version = "1.0.0",
                Uptime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC")
            },
            // 🆕 Auth status
            Authentication = new
            {
                JwtEnabled = true,
                Issuer = builder.Configuration["JwtSettings:Issuer"],
                Audience = builder.Configuration["JwtSettings:Audience"]
            },
            Timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: $"Database connection failed: {ex.Message}",
            statusCode: 503,
            title: "Service Unavailable"
        );
    }
})
.WithTags("Health")
.WithOpenApi();

// Database test endpoint
app.MapGet("/api/test-db", async (ApplicationDbContext context) =>
{
    try
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        
        // Тестуємо основні таблиці
        var cardCount = await context.Cards.CountAsync();
        var listingCount = await context.Listings.CountAsync();
        var userCount = await context.Users.CountAsync();
        var activeListingsCount = await context.Listings.CountAsync(l => l.IsActive);
        
        // Тестуємо складний запит
        var avgPrice = await context.Listings
            .Where(l => l.IsActive)
            .AverageAsync(l => (double?)l.Price) ?? 0;
            
        sw.Stop();
        
        return Results.Ok(new 
        { 
            Status = "Connected",
            Performance = new
            {
                QueryTime = $"{sw.ElapsedMilliseconds}ms",
                TotalQueries = 5
            },
            Statistics = new
            {
                Cards = cardCount,
                Listings = listingCount,
                ActiveListings = activeListingsCount,
                Users = userCount,
                AveragePrice = Math.Round(avgPrice, 2)
            },
            Database = new
            {
                Provider = "PostgreSQL",
                ConnectionString = context.Database.GetConnectionString()?.Substring(0, 50) + "...",
            },
            Timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: $"Database test failed: {ex.Message}",
            statusCode: 500,
            title: "Database Error"
        );
    }
})
.WithTags("Database")
.WithOpenApi();

// Featured cards endpoint з rate limiting
app.MapGet("/api/cards/featured", async (ApplicationDbContext context, [FromQuery] int limit = 10) =>
{
    try
    {
        // Валідація limit параметра
        if (limit < 1 || limit > 50)
        {
            return Results.BadRequest(new { Error = "Limit must be between 1 and 50" });
        }

        var popularCards = await context.Cards
            .Include(c => c.CardColors.Take(3))
                .ThenInclude(cc => cc.CardColor)
            .Where(c => context.Listings.Any(l => l.ProductId == c.ProductId && l.IsActive))
            .OrderByDescending(c => 
                context.Listings.Count(l => l.ProductId == c.ProductId && l.IsActive))
            .ThenByDescending(c => 
                c.Rarity == "SEC" ? 7 :
                c.Rarity == "SR" ? 6 :
                c.Rarity == "R" ? 5 :
                c.Rarity == "UC" ? 4 :
                c.Rarity == "C" ? 3 :
                c.Rarity == "L" ? 2 :
                c.Rarity == "P" ? 1 : 0)
            .Take(limit)
            .ToListAsync();

        // Отримуємо мінімальні ціни окремим запитом для оптимізації
        var productIds = popularCards.Select(c => c.ProductId).ToList();
        var minPrices = await context.Listings
            .Where(l => productIds.Contains(l.ProductId) && l.IsActive)
            .GroupBy(l => l.ProductId)
            .Select(g => new { ProductId = g.Key, MinPrice = g.Min(l => l.Price), Count = g.Count() })
            .ToDictionaryAsync(x => x.ProductId, x => new { x.MinPrice, x.Count });

        var cardDtos = popularCards.Select(card => new
        {
            ProductId = card.ProductId,
            BaseCardId = card.BaseCardId,
            Name = card.Name,
            Rarity = card.Rarity,
            ImageUrl = card.ImageUrl,
            IsAlternateArt = card.IsAlternateArt,
            SeriesName = card.SeriesName,
            Colors = card.CardColors.Select(cc => new { 
                Code = cc.ColorCode,
                Name = cc.CardColor.Name,
                HexColor = cc.CardColor.HexColor,
                IsPrimary = cc.IsPrimary
            }).ToList(),
            MinPrice = minPrices.ContainsKey(card.ProductId) ? minPrices[card.ProductId].MinPrice : 0m,
            ListingCount = minPrices.ContainsKey(card.ProductId) ? minPrices[card.ProductId].Count : 0
        }).ToList();

        return Results.Ok(cardDtos);
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error fetching featured cards with limit {Limit}", limit);
        
        return Results.Problem(
            detail: "Error fetching featured cards",
            statusCode: 500,
            title: "Internal Server Error"
        );
    }
})
.WithTags("Cards")
.WithOpenApi()
.RequireRateLimiting("FeaturedPolicy");

// Startup message
app.Lifetime.ApplicationStarted.Register(() =>
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("🚀 One Piece TCG Marketplace API started successfully!");
    logger.LogInformation("📊 Swagger UI: {SwaggerUrl}", "http://localhost:5000/swagger");
    logger.LogInformation("🏥 Health Check: {HealthUrl}", "http://localhost:5000/health");
    logger.LogInformation("🌐 API Base URL: {ApiUrl}", "http://localhost:5000/api");
    logger.LogInformation("🔐 Auth endpoints: {AuthUrls}", "/api/auth/login, /api/auth/register, /api/auth/validate"); // 🆕
});

// Graceful shutdown
app.Lifetime.ApplicationStopping.Register(() =>
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("🛑 One Piece TCG Marketplace API is shutting down...");
});

// Configure URLs
app.Urls.Add("http://localhost:5000");
app.Urls.Add("http://192.168.31.78:5000");

app.Run();

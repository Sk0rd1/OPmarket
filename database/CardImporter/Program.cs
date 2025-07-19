using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;
using Microsoft.Extensions.Configuration;
using Npgsql;

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json")
    .Build();

var connectionString = configuration.GetConnectionString("DefaultConnection");
var csvFilePath = configuration["ImportSettings:CsvFilePath"];
var batchSize = int.Parse(configuration["ImportSettings:BatchSize"] ?? "100");

Console.WriteLine("🚀 Запуск імпорту карт One Piece TCG (Marketplace версія)...");
Console.WriteLine($"CSV файл: {csvFilePath}");
Console.WriteLine($"Розмір пакету: {batchSize}");

try
{
    await ImportCardsFromCsv(connectionString!, csvFilePath!, batchSize);
    Console.WriteLine("✅ Імпорт завершено успішно!");
    await ShowImportStatistics(connectionString!);
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Помилка: {ex.Message}");
    Console.WriteLine($"Деталі: {ex.StackTrace}");
}

static async Task ImportCardsFromCsv(string connectionString, string csvFilePath, int batchSize)
{
    if (!File.Exists(csvFilePath))
    {
        throw new FileNotFoundException($"CSV файл не знайдено: {csvFilePath}");
    }

    using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    
    Console.WriteLine("🔗 Підключення до БД встановлено");
    
    // Читання CSV з правильною конфігурацією
    using var reader = new StringReader(File.ReadAllText(csvFilePath));
    using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
    {
        Delimiter = "|",
        HasHeaderRecord = true,
        MissingFieldFound = null,
        PrepareHeaderForMatch = args => args.Header.ToLower(),
        HeaderValidated = null
    });

    // Додати кастомні конвертери
    csv.Context.TypeConverterCache.AddConverter<int?>(new NullableIntConverter());
    csv.Context.TypeConverterCache.AddConverter<bool>(new CustomBooleanConverter());

    var records = csv.GetRecords<CardCsvRecord>().ToList();
    Console.WriteLine($"📄 Знайдено {records.Count} карт в CSV файлі");

    // Групувати записи по base_card_id для обробки alternate art
    var groupedRecords = records.GroupBy(r => r.id).ToList();
    Console.WriteLine($"📊 Унікальних карт: {groupedRecords.Count}");

    int imported = 0;
    int skipped = 0;
    int errors = 0;

    // Імпорт по групах
    foreach (var group in groupedRecords)
    {
        try
        {
            foreach (var record in group)
            {
                await ImportSingleCard(connection, record);
                imported++;
                
                if (imported % 50 == 0)
                {
                    Console.WriteLine($"📥 Імпортовано: {imported}/{records.Count}");
                }
            }
        }
        catch (Exception ex)
        {
            errors++;
            Console.WriteLine($"⚠️ Помилка з картою {group.Key}: {ex.Message}");
        }
    }

    Console.WriteLine($"📊 Результат:");
    Console.WriteLine($"   ✅ Імпортовано: {imported}");
    Console.WriteLine($"   ⏭️ Пропущено: {skipped}");
    Console.WriteLine($"   ❌ Помилки: {errors}");
}

static async Task ImportSingleCard(NpgsqlConnection connection, CardCsvRecord record)
{
    // Генерувати унікальний product_id (UUID буде згенеровано автоматично БД)
    var baseCardId = record.id;
    var language = "EN"; // Всі карти англійською
    var isAlternateArt = record.alternate_art;

    // Додати серію якщо не існує
    if (!string.IsNullOrEmpty(record.series_id))
    {
        await EnsureSeriesExists(connection, record.series_id, record.series_name ?? "");
    }

    // Вставити карту
    var insertCardQuery = @"
        INSERT INTO cards (base_card_id, name, card_type_detail, effect, power, counter, 
                          attribute, rarity, image_url, set_code, language, is_alternate_art,
                          series_id, series_name, created_at, updated_at)
        VALUES (@base_card_id, @name, @card_type_detail, @effect, @power, @counter, 
                @attribute, @rarity, @image_url, @set_code, @language, @is_alternate_art,
                @series_id, @series_name, @created_at, @updated_at)
        RETURNING product_id";

    using var cardCmd = new NpgsqlCommand(insertCardQuery, connection);
    cardCmd.Parameters.AddWithValue("@base_card_id", baseCardId);
    cardCmd.Parameters.AddWithValue("@name", record.name);
    cardCmd.Parameters.AddWithValue("@card_type_detail", record.card_type ?? "");
    cardCmd.Parameters.AddWithValue("@effect", record.effect ?? "");
    cardCmd.Parameters.AddWithValue("@power", record.power.HasValue ? record.power.Value : DBNull.Value);
    cardCmd.Parameters.AddWithValue("@counter", record.counter.HasValue ? record.counter.Value : DBNull.Value);
    cardCmd.Parameters.AddWithValue("@attribute", record.attribute ?? "");
    cardCmd.Parameters.AddWithValue("@rarity", record.rarity ?? "");
    cardCmd.Parameters.AddWithValue("@image_url", record.image_url ?? "");
    cardCmd.Parameters.AddWithValue("@set_code", ExtractSetCode(baseCardId));
    cardCmd.Parameters.AddWithValue("@language", language);
    cardCmd.Parameters.AddWithValue("@is_alternate_art", isAlternateArt);
    cardCmd.Parameters.AddWithValue("@series_id", record.series_id ?? (object)DBNull.Value);
    cardCmd.Parameters.AddWithValue("@series_name", record.series_name ?? (object)DBNull.Value);
    cardCmd.Parameters.AddWithValue("@created_at", DateTime.UtcNow);
    cardCmd.Parameters.AddWithValue("@updated_at", DateTime.UtcNow);

    // Отримати згенерований product_id
    var productId = (Guid)(await cardCmd.ExecuteScalarAsync())!;

    // Додати зв'язок з серією якщо потрібно
    if (!string.IsNullOrEmpty(record.series_id))
    {
        await AddCardToSeries(connection, productId, record.series_id);
    }

    // Додати колір через junction таблицю
    if (!string.IsNullOrEmpty(record.color))
    {
        await AddCardColor(connection, productId, record.color);
    }

    // Показати прогрес для alternate art
    var artType = isAlternateArt ? "ALT" : "BASE";
    Console.WriteLine($"➕ Додано: {baseCardId} ({artType}) -> {productId}");
}

static async Task EnsureSeriesExists(NpgsqlConnection connection, string seriesId, string seriesName)
{
    var checkQuery = "SELECT COUNT(*) FROM card_series WHERE id = @id";
    using var checkCmd = new NpgsqlCommand(checkQuery, connection);
    checkCmd.Parameters.AddWithValue("@id", seriesId);
    
    var exists = (long)(await checkCmd.ExecuteScalarAsync())! > 0;
    if (!exists)
    {
        var insertQuery = "INSERT INTO card_series (id, name, created_at) VALUES (@id, @name, @created_at)";
        using var insertCmd = new NpgsqlCommand(insertQuery, connection);
        insertCmd.Parameters.AddWithValue("@id", seriesId);
        insertCmd.Parameters.AddWithValue("@name", seriesName);
        insertCmd.Parameters.AddWithValue("@created_at", DateTime.UtcNow);
        await insertCmd.ExecuteNonQueryAsync();
        
        Console.WriteLine($"📦 Додано нову серію: {seriesName} ({seriesId})");
    }
}

static async Task AddCardToSeries(NpgsqlConnection connection, Guid productId, string seriesId)
{
    var insertQuery = @"
        INSERT INTO card_series_junction (product_id, series_id, created_at) 
        VALUES (@product_id, @series_id, @created_at)
        ON CONFLICT (product_id, series_id) DO NOTHING";
    
    using var cmd = new NpgsqlCommand(insertQuery, connection);
    cmd.Parameters.AddWithValue("@product_id", productId);
    cmd.Parameters.AddWithValue("@series_id", seriesId);
    cmd.Parameters.AddWithValue("@created_at", DateTime.UtcNow);
    
    await cmd.ExecuteNonQueryAsync();
}

static async Task AddCardColor(NpgsqlConnection connection, Guid productId, string colorName)
{
    // Перевірити чи колір існує
    var colorCheckQuery = "SELECT COUNT(*) FROM card_colors WHERE name = @color";
    using var colorCheckCmd = new NpgsqlCommand(colorCheckQuery, connection);
    colorCheckCmd.Parameters.AddWithValue("@color", colorName);
    
    var colorExists = (long)(await colorCheckCmd.ExecuteScalarAsync())! > 0;
    
    if (!colorExists)
    {
        // Додати новий колір
        var insertColorQuery = "INSERT INTO card_colors (code, name, created_at) VALUES (@code, @name, @created_at)";
        using var insertColorCmd = new NpgsqlCommand(insertColorQuery, connection);
        insertColorCmd.Parameters.AddWithValue("@code", colorName);
        insertColorCmd.Parameters.AddWithValue("@name", colorName);
        insertColorCmd.Parameters.AddWithValue("@created_at", DateTime.UtcNow);
        await insertColorCmd.ExecuteNonQueryAsync();
        
        Console.WriteLine($"🎨 Додано новий колір: {colorName}");
    }

    // Додати зв'язок карта-колір
    var insertJunctionQuery = @"
        INSERT INTO card_colors_junction (product_id, color_code, is_primary, created_at) 
        VALUES (@product_id, @color_code, @is_primary, @created_at)
        ON CONFLICT (product_id, color_code) DO NOTHING";
    
    using var junctionCmd = new NpgsqlCommand(insertJunctionQuery, connection);
    junctionCmd.Parameters.AddWithValue("@product_id", productId);
    junctionCmd.Parameters.AddWithValue("@color_code", colorName);
    junctionCmd.Parameters.AddWithValue("@is_primary", true);
    junctionCmd.Parameters.AddWithValue("@created_at", DateTime.UtcNow);
    
    await junctionCmd.ExecuteNonQueryAsync();
}

static string ExtractSetCode(string cardId)
{
    var parts = cardId.Split('-');
    return parts.Length > 0 ? parts[0] : "";
}

static async Task ShowImportStatistics(string connectionString)
{
    using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    
    Console.WriteLine("\n📊 Статистика імпорту:");
    
    var statsQuery = @"
        SELECT 
            COUNT(*) as total_products,
            COUNT(DISTINCT base_card_id) as unique_cards,
            COUNT(CASE WHEN is_alternate_art THEN 1 END) as alternate_arts,
            COUNT(DISTINCT language) as languages,
            COUNT(DISTINCT series_id) as series_count
        FROM cards";
    
    using var cmd = new NpgsqlCommand(statsQuery, connection);
    using var reader = await cmd.ExecuteReaderAsync();
    
    if (await reader.ReadAsync())
    {
        Console.WriteLine($"   📦 Всього продуктів: {reader.GetInt64(0)}");
        Console.WriteLine($"   🃏 Унікальних карт: {reader.GetInt64(1)}");
        Console.WriteLine($"   🎨 Alternate Art: {reader.GetInt64(2)}");
        Console.WriteLine($"   🌍 Мов: {reader.GetInt64(3)}");
        Console.WriteLine($"   📚 Серій: {reader.GetInt64(4)}");
    }
}

// Моделі залишаються ті ж самі
public class CardCsvRecord
{
    public string id { get; set; } = "";
    public string name { get; set; } = "";
    public string? rarity { get; set; }
    public string? type { get; set; }
    public string? attribute { get; set; }
    public int? power { get; set; }
    public int? counter { get; set; }
    public string? color { get; set; }
    public string? card_type { get; set; }
    public string? effect { get; set; }
    public string? image_url { get; set; }
    public bool alternate_art { get; set; }
    public string? series_id { get; set; }
    public string? series_name { get; set; }
}

public class NullableIntConverter : CsvHelper.TypeConversion.DefaultTypeConverter
{
    public override object? ConvertFromString(string? text, CsvHelper.IReaderRow row, CsvHelper.Configuration.MemberMapData memberMapData)
    {
        if (string.IsNullOrWhiteSpace(text) || text == "-" || text == "N/A" || text == "null")
            return null;

        if (int.TryParse(text, out int result))
            return result;

        return null;
    }
}

public class CustomBooleanConverter : CsvHelper.TypeConversion.DefaultTypeConverter
{
    public override object ConvertFromString(string? text, CsvHelper.IReaderRow row, CsvHelper.Configuration.MemberMapData memberMapData)
    {
        if (string.IsNullOrWhiteSpace(text))
            return false;

        text = text.Trim().ToLower();
        
        return text switch
        {
            "true" => true,
            "false" => false,
            "1" => true,
            "0" => false,
            "yes" => true,
            "no" => false,
            _ => false
        };
    }
}

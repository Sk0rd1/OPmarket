-- Міграція БД для One Piece TCG Marketplace
-- Додавання підтримки мови, серій, alternate art та унікального product_id

BEGIN;

-- 1. Створити таблицю серій/паків
CREATE TABLE IF NOT EXISTS card_series (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Створити тимчасову таблицю для нової структури карт
CREATE TABLE cards_new (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_card_id VARCHAR(20) NOT NULL, -- Оригінальний ID карти (EB01-006)
    name VARCHAR(200) NOT NULL,
    card_type_detail VARCHAR(100),
    effect TEXT,
    power INTEGER,
    cost INTEGER,
    life INTEGER,
    counter INTEGER,
    attribute VARCHAR(50),
    rarity VARCHAR(10),
    set_code VARCHAR(20),
    collector_number VARCHAR(10),
    artist VARCHAR(100),
    image_url VARCHAR(500),
    language VARCHAR(5) NOT NULL DEFAULT 'EN', -- Мова карти
    is_alternate_art BOOLEAN DEFAULT FALSE,     -- Чи це alternate art
    series_id VARCHAR(20),                      -- ID серії
    series_name VARCHAR(200),                   -- Назва серії
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Скопіювати існуючі дані в нову таблицю
INSERT INTO cards_new (
    base_card_id, name, card_type_detail, effect, power, cost, life, counter,
    attribute, rarity, set_code, collector_number, artist, image_url,
    language, is_alternate_art, search_vector, created_at, updated_at
)
SELECT 
    id as base_card_id,
    name, card_type_detail, effect, power, cost, life, counter,
    attribute, rarity, set_code, collector_number, artist, image_url,
    'EN' as language,
    FALSE as is_alternate_art,
    search_vector, created_at, updated_at
FROM cards;

-- 4. Створити нову junction таблицю для кольорів
CREATE TABLE card_colors_junction_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES cards_new(product_id) ON DELETE CASCADE,
    color_code VARCHAR(20) NOT NULL REFERENCES card_colors(code) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, color_code)
);

-- 5. Скопіювати зв'язки кольорів (знайти product_id за base_card_id)
INSERT INTO card_colors_junction_new (product_id, color_code, is_primary, created_at)
SELECT 
    cn.product_id,
    ccj.color_code,
    ccj.is_primary,
    ccj.created_at
FROM card_colors_junction ccj
JOIN cards_new cn ON ccj.card_id = cn.base_card_id;

-- 6. Створити junction таблицю для серій
CREATE TABLE card_series_junction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES cards_new(product_id) ON DELETE CASCADE,
    series_id VARCHAR(20) NOT NULL REFERENCES card_series(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, series_id)
);

-- 7. Видалити старі таблиці та перейменувати нові
DROP TABLE card_colors_junction CASCADE;
DROP TABLE cards CASCADE;

ALTER TABLE cards_new RENAME TO cards;
ALTER TABLE card_colors_junction_new RENAME TO card_colors_junction;

-- 8. Створити індекси для нової структури
CREATE INDEX idx_cards_product_id ON cards(product_id);
CREATE INDEX idx_cards_base_card_id ON cards(base_card_id);
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_type ON cards(card_type_detail);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_set ON cards(set_code);
CREATE INDEX idx_cards_language ON cards(language);
CREATE INDEX idx_cards_alternate_art ON cards(is_alternate_art);
CREATE INDEX idx_cards_series ON cards(series_id);
CREATE INDEX idx_cards_search ON cards USING gin(search_vector);

CREATE INDEX idx_card_colors_junction_product ON card_colors_junction(product_id);
CREATE INDEX idx_card_colors_junction_color ON card_colors_junction(color_code);
CREATE INDEX idx_card_colors_junction_primary ON card_colors_junction(is_primary);

CREATE INDEX idx_card_series_junction_product ON card_series_junction(product_id);
CREATE INDEX idx_card_series_junction_series ON card_series_junction(series_id);

-- 9. Оновити функції для роботи з новою структурою
CREATE OR REPLACE FUNCTION get_card_colors(product_id_param UUID)
RETURNS TEXT[] AS $$
DECLARE
    colors TEXT[];
BEGIN
    SELECT ARRAY_AGG(cc.name ORDER BY ccj.is_primary DESC, cc.name)
    INTO colors
    FROM card_colors_junction ccj
    JOIN card_colors cc ON ccj.color_code = cc.code
    WHERE ccj.product_id = product_id_param;
    
    RETURN COALESCE(colors, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_primary_card_color(product_id_param UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    primary_color VARCHAR(50);
BEGIN
    SELECT cc.name
    INTO primary_color
    FROM card_colors_junction ccj
    JOIN card_colors cc ON ccj.color_code = cc.code
    WHERE ccj.product_id = product_id_param AND ccj.is_primary = TRUE
    LIMIT 1;
    
    RETURN primary_color;
END;
$$ LANGUAGE plpgsql;

-- 10. Оновити функцію пошукового вектора
CREATE OR REPLACE FUNCTION update_cards_search_vector()
RETURNS TRIGGER AS $$
DECLARE
    color_names TEXT;
BEGIN
    -- Отримуємо всі кольори карти
    SELECT string_agg(cc.name, ' ')
    INTO color_names
    FROM card_colors_junction ccj
    JOIN card_colors cc ON ccj.color_code = cc.code
    WHERE ccj.product_id = NEW.product_id;
    
    NEW.search_vector = to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.card_type_detail, '') || ' ' || 
        COALESCE(NEW.effect, '') || ' ' ||
        COALESCE(color_names, '') || ' ' ||
        COALESCE(NEW.series_name, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Створити тригер для оновлення пошукового вектора
DROP TRIGGER IF EXISTS update_cards_search_vector_trigger ON cards;
CREATE TRIGGER update_cards_search_vector_trigger
    BEFORE INSERT OR UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_cards_search_vector();

-- 12. Функція для оновлення пошукового вектора при зміні кольорів
CREATE OR REPLACE FUNCTION update_card_search_on_color_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_product_id UUID;
BEGIN
    -- Визначаємо product_id карти залежно від операції
    IF TG_OP = 'DELETE' THEN
        affected_product_id = OLD.product_id;
    ELSE
        affected_product_id = NEW.product_id;
    END IF;
    
    -- Оновлюємо пошуковий вектор карти
    UPDATE cards 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE product_id = affected_product_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 13. Створити тригер для кольорів
DROP TRIGGER IF EXISTS update_card_search_on_color_change_trigger ON card_colors_junction;
CREATE TRIGGER update_card_search_on_color_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON card_colors_junction
    FOR EACH ROW EXECUTE FUNCTION update_card_search_on_color_change();

-- 14. Оновити view для карт з кольорами
DROP VIEW IF EXISTS cards_with_colors CASCADE;
CREATE OR REPLACE VIEW cards_with_colors AS
SELECT 
    c.*,
    ARRAY_AGG(DISTINCT cc.name ORDER BY cc.name) as colors,
    ARRAY_AGG(DISTINCT cc.code ORDER BY cc.code) as color_codes,
    (SELECT cc2.name 
     FROM card_colors_junction ccj2 
     JOIN card_colors cc2 ON ccj2.color_code = cc2.code 
     WHERE ccj2.product_id = c.product_id AND ccj2.is_primary = TRUE 
     LIMIT 1) as primary_color
FROM cards c
LEFT JOIN card_colors_junction ccj ON c.product_id = ccj.product_id
LEFT JOIN card_colors cc ON ccj.color_code = cc.code
GROUP BY c.product_id;

-- 15. Створити view для marketplace (зручна для показу товарів)
CREATE OR REPLACE VIEW marketplace_products AS
SELECT 
    c.product_id,
    c.base_card_id,
    c.name,
    c.rarity,
    c.language,
    c.is_alternate_art,
    c.image_url,
    c.power,
    c.counter,
    c.attribute,
    c.set_code,
    c.series_name,
    (SELECT cc.name 
     FROM card_colors_junction ccj 
     JOIN card_colors cc ON ccj.color_code = cc.code 
     WHERE ccj.product_id = c.product_id AND ccj.is_primary = TRUE 
     LIMIT 1) as primary_color,
    ARRAY_AGG(DISTINCT cc.name ORDER BY cc.name) as all_colors
FROM cards c
LEFT JOIN card_colors_junction ccj ON c.product_id = ccj.product_id
LEFT JOIN card_colors cc ON ccj.color_code = cc.code
GROUP BY c.product_id, c.base_card_id, c.name, c.rarity, c.language, 
         c.is_alternate_art, c.image_url, c.power, c.counter, 
         c.attribute, c.set_code, c.series_name;

-- 16. Додати коментарі
COMMENT ON TABLE cards IS 'Main cards table with marketplace-ready structure';
COMMENT ON COLUMN cards.product_id IS 'Unique marketplace product ID - use this for sales/listings';
COMMENT ON COLUMN cards.base_card_id IS 'Original card ID from TCG (e.g., EB01-006)';
COMMENT ON COLUMN cards.language IS 'Card language (EN, JP, etc.)';
COMMENT ON COLUMN cards.is_alternate_art IS 'True if this is alternate art version';
COMMENT ON COLUMN cards.series_id IS 'Series/set ID where this card appears';
COMMENT ON COLUMN cards.series_name IS 'Series/set name where this card appears';

COMMENT ON VIEW marketplace_products IS 'Convenient view for marketplace listings';

-- 17. Додати основні мови
CREATE TABLE IF NOT EXISTS card_languages (
    code VARCHAR(5) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    native_name VARCHAR(50)
);

INSERT INTO card_languages (code, name, native_name) VALUES
('EN', 'English', 'English'),
('JP', 'Japanese', '日本語'),
('CN', 'Chinese', '中文'),
('KR', 'Korean', '한국어'),
('FR', 'French', 'Français'),
('DE', 'German', 'Deutsch'),
('ES', 'Spanish', 'Español'),
('IT', 'Italian', 'Italiano')
ON CONFLICT (code) DO NOTHING;

-- 18. Додати foreign key для мови
ALTER TABLE cards ADD CONSTRAINT fk_cards_language 
    FOREIGN KEY (language) REFERENCES card_languages(code);

COMMIT;

-- 19. Показати результат міграції
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as total_products,
    COUNT(DISTINCT base_card_id) as unique_cards,
    COUNT(CASE WHEN is_alternate_art THEN 1 END) as alternate_arts,
    COUNT(DISTINCT language) as languages
FROM cards;

-- Приклади нового API:

-- Знайти всі версії конкретної карти:
-- SELECT * FROM cards WHERE base_card_id = 'EB01-006';

-- Знайти тільки alternate art карти:
-- SELECT * FROM marketplace_products WHERE is_alternate_art = TRUE;

-- Знайти карти певною мовою:
-- SELECT * FROM marketplace_products WHERE language = 'EN';

-- Для створення продажу тепер використовувати product_id:
-- INSERT INTO listings (product_id, condition_code, price, seller_id) 
-- VALUES ('uuid-here', 'NM', 15.99, 'seller-id');

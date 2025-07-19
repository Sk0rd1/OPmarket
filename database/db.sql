-- One Piece TCG Marketplace Database Schema
-- Оновлена версія з актуальною структурою

-- Увімкнути розширення для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Таблиця типів карт
CREATE TABLE IF NOT EXISTS card_types (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблиця кольорів карт
CREATE TABLE IF NOT EXISTS card_colors (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    hex_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Таблиця умов карт (спрощена версія)
CREATE TABLE IF NOT EXISTS card_conditions (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 4. Таблиця карт (основна, без color_code)
CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(20) PRIMARY KEY,
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
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Junction таблиця для багатозначних кольорів карт
CREATE TABLE IF NOT EXISTS card_colors_junction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id VARCHAR(20) NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    color_code VARCHAR(20) NOT NULL REFERENCES card_colors(code) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_id, color_code)
);

-- Індекси для оптимізації
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(card_type_detail);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_code);
CREATE INDEX IF NOT EXISTS idx_cards_search ON cards USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_card_colors_junction_card ON card_colors_junction(card_id);
CREATE INDEX IF NOT EXISTS idx_card_colors_junction_color ON card_colors_junction(color_code);
CREATE INDEX IF NOT EXISTS idx_card_colors_junction_primary ON card_colors_junction(is_primary);

-- Початкові дані для кольорів карт
INSERT INTO card_colors (code, name, hex_color) VALUES
('Red', 'Red', '#FF0000'),
('Green', 'Green', '#00FF00'),
('Blue', 'Blue', '#0000FF'),
('Purple', 'Purple', '#800080'),
('Yellow', 'Yellow', '#FFFF00'),
('Black', 'Black', '#000000')
ON CONFLICT (code) DO NOTHING;

-- Початкові дані для умов карт (4 основні умови)
INSERT INTO card_conditions (code, name, description, sort_order) VALUES
('M', 'Mint', 'Ідеальний стан - абсолютно нова карта', 1),
('NM', 'Near Mint', 'Майже ідеальний стан - мінімальні сліди використання', 2),
('MP', 'Moderately Played', 'Помірне використання - помітні але не критичні пошкодження', 3),
('HP', 'Heavily Played', 'Сильне використання - значні пошкодження', 4)
ON CONFLICT (code) DO NOTHING;

-- Початкові дані для типів карт
INSERT INTO card_types (code, name, description) VALUES
('LEADER', 'Leader', 'Leader cards'),
('CHARACTER', 'Character', 'Character cards'),
('EVENT', 'Event', 'Event cards'),
('STAGE', 'Stage', 'Stage cards'),
('DON', 'DON!!', 'DON!! cards - special resource cards')
ON CONFLICT (code) DO NOTHING;

-- Функція для отримання кольорів карти
CREATE OR REPLACE FUNCTION get_card_colors(card_id_param VARCHAR(20))
RETURNS TEXT[] AS $$
DECLARE
    colors TEXT[];
BEGIN
    SELECT ARRAY_AGG(cc.name ORDER BY ccj.is_primary DESC, cc.name)
    INTO colors
    FROM card_colors_junction ccj
    JOIN card_colors cc ON ccj.color_code = cc.code
    WHERE ccj.card_id = card_id_param;
    
    RETURN COALESCE(colors, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- Функція для отримання основного кольору карти
CREATE OR REPLACE FUNCTION get_primary_card_color(card_id_param VARCHAR(20))
RETURNS VARCHAR(50) AS $$
DECLARE
    primary_color VARCHAR(50);
BEGIN
    SELECT cc.name
    INTO primary_color
    FROM card_colors_junction ccj
    JOIN card_colors cc ON ccj.color_code = cc.code
    WHERE ccj.card_id = card_id_param AND ccj.is_primary = TRUE
    LIMIT 1;
    
    RETURN primary_color;
END;
$$ LANGUAGE plpgsql;

-- Функція для оновлення пошукового вектора
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
    WHERE ccj.card_id = NEW.id;
    
    NEW.search_vector = to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.card_type_detail, '') || ' ' || 
        COALESCE(NEW.effect, '') || ' ' ||
        COALESCE(color_names, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичного оновлення пошукового вектора при зміні карти
CREATE OR REPLACE TRIGGER update_cards_search_vector_trigger
    BEFORE INSERT OR UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_cards_search_vector();

-- Функція для оновлення пошукового вектора при зміні кольорів
CREATE OR REPLACE FUNCTION update_card_search_on_color_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_card_id VARCHAR(20);
BEGIN
    -- Визначаємо ID карти залежно від операції
    IF TG_OP = 'DELETE' THEN
        affected_card_id = OLD.card_id;
    ELSE
        affected_card_id = NEW.card_id;
    END IF;
    
    -- Оновлюємо пошуковий вектор карти
    UPDATE cards 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = affected_card_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Тригер для оновлення пошукового вектора при зміні кольорів
CREATE OR REPLACE TRIGGER update_card_search_on_color_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON card_colors_junction
    FOR EACH ROW EXECUTE FUNCTION update_card_search_on_color_change();

-- View для зручного отримання інформації про карти з кольорами
CREATE OR REPLACE VIEW cards_with_colors AS
SELECT 
    c.*,
    ARRAY_AGG(DISTINCT cc.name ORDER BY cc.name) as colors,
    ARRAY_AGG(DISTINCT cc.code ORDER BY cc.code) as color_codes,
    (SELECT cc2.name 
     FROM card_colors_junction ccj2 
     JOIN card_colors cc2 ON ccj2.color_code = cc2.code 
     WHERE ccj2.card_id = c.id AND ccj2.is_primary = TRUE 
     LIMIT 1) as primary_color
FROM cards c
LEFT JOIN card_colors_junction ccj ON c.id = ccj.card_id
LEFT JOIN card_colors cc ON ccj.color_code = cc.code
GROUP BY c.id;

-- Коментарі до таблиць та функцій
COMMENT ON TABLE card_colors_junction IS 'Junction table for many-to-many relationship between cards and colors';
COMMENT ON COLUMN card_colors_junction.is_primary IS 'Indicates if this is the primary color of the card';
COMMENT ON FUNCTION get_card_colors(VARCHAR) IS 'Returns array of color names for a given card';
COMMENT ON FUNCTION get_primary_card_color(VARCHAR) IS 'Returns primary color name for a given card';
COMMENT ON VIEW cards_with_colors IS 'View that includes card information with aggregated color data';

-- Приклади використання:

-- Додавання кольорів до карти:
-- INSERT INTO card_colors_junction (card_id, color_code, is_primary) VALUES 
-- ('CARD_ID', 'Red', TRUE),
-- ('CARD_ID', 'Green', FALSE);

-- Пошук карт за кольором:
-- SELECT DISTINCT c.* FROM cards c
-- JOIN card_colors_junction ccj ON c.id = ccj.card_id
-- WHERE ccj.color_code = 'Red';

-- Пошук багатокольорових карт:
-- SELECT c.*, COUNT(ccj.color_code) as color_count
-- FROM cards c
-- JOIN card_colors_junction ccj ON c.id = ccj.card_id
-- GROUP BY c.id
-- HAVING COUNT(ccj.color_code) > 1;

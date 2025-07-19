-- Оновлення схеми One Piece TCG Marketplace Database
-- Додавання нових умов карт, багатозначних кольорів та типу DON

-- 1. Додавання нових умов карт
INSERT INTO card_conditions (code, name, description, price_modifier, sort_order) VALUES
('MT', 'Mint', 'Ідеальний стан - абсолютно нова карта', 1.100, 0),
('EX', 'Excellent', 'Мінімальне використання - майже ідеальний стан', 0.950, 1.5),
('VG', 'Very Good', 'Дещо помітні пошкодження - незначні сліди використання', 0.750, 2.5),
('G', 'Good', 'Помітні пошкодження - видимі але не критичні пошкодження', 0.600, 3.5);

-- Оновлення sort_order для існуючих умов
UPDATE card_conditions SET sort_order = 1 WHERE code = 'NM';
UPDATE card_conditions SET sort_order = 2 WHERE code = 'LP';
UPDATE card_conditions SET sort_order = 3 WHERE code = 'MP';
UPDATE card_conditions SET sort_order = 4 WHERE code = 'HP';
UPDATE card_conditions SET sort_order = 5 WHERE code = 'DMG';

-- 2. Видалення Multicolor з card_colors
DELETE FROM card_colors WHERE code = 'Multicolor';

-- 3. Створення junction таблиці для many-to-many зв'язку між картами та кольорами
CREATE TABLE card_colors_junction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id VARCHAR(20) NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    color_code VARCHAR(20) NOT NULL REFERENCES card_colors(code) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE, -- Основний колір карти
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_id, color_code)
);

-- Індекси для junction таблиці
CREATE INDEX idx_card_colors_junction_card ON card_colors_junction(card_id);
CREATE INDEX idx_card_colors_junction_color ON card_colors_junction(color_code);
CREATE INDEX idx_card_colors_junction_primary ON card_colors_junction(is_primary);

-- 4. Додавання типу DON до card_types
INSERT INTO card_types (code, name, description) VALUES
('DON', 'DON!!', 'DON!! cards - special resource cards');

-- 5. Міграція існуючих даних з cards.color_code до junction таблиці
-- (Виконати після того, як у cards таблиці є дані)
INSERT INTO card_colors_junction (card_id, color_code, is_primary)
SELECT id, color_code, TRUE
FROM cards 
WHERE color_code IS NOT NULL;

-- 6. Видалення color_code колонки з cards таблиці
-- Спочатку видаляємо індекс
DROP INDEX IF EXISTS idx_cards_color;

-- Видаляємо foreign key constraint та колонку
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_color_code_fkey;
ALTER TABLE cards DROP COLUMN IF EXISTS color_code;

-- 7. Створення функції для отримання кольорів карти
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

-- 8. Створення функції для отримання основного кольору карти
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

-- 9. Оновлення пошукового вектора для включення інформації про кольори
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
$$ language 'plpgsql';

-- 10. Створення тригера для оновлення пошукового вектора при зміні кольорів
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
$$ language 'plpgsql';

CREATE TRIGGER update_card_search_on_color_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON card_colors_junction
    FOR EACH ROW EXECUTE FUNCTION update_card_search_on_color_change();

-- 11. Створення view для зручного отримання інформації про карти з кольорами
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

-- 12. Приклади запитів для роботи з новою структурою

-- Додавання кольорів до карти
-- INSERT INTO card_colors_junction (card_id, color_code, is_primary) VALUES 
-- ('CARD_ID', 'Red', TRUE),
-- ('CARD_ID', 'Green', FALSE);

-- Пошук карт за кольором
-- SELECT DISTINCT c.* FROM cards c
-- JOIN card_colors_junction ccj ON c.id = ccj.card_id
-- WHERE ccj.color_code = 'Red';

-- Пошук багатокольорових карт
-- SELECT c.*, COUNT(ccj.color_code) as color_count
-- FROM cards c
-- JOIN card_colors_junction ccj ON c.id = ccj.card_id
-- GROUP BY c.id
-- HAVING COUNT(ccj.color_code) > 1;

COMMENT ON TABLE card_colors_junction IS 'Junction table for many-to-many relationship between cards and colors';
COMMENT ON COLUMN card_colors_junction.is_primary IS 'Indicates if this is the primary color of the card';
COMMENT ON FUNCTION get_card_colors(VARCHAR) IS 'Returns array of color names for a given card';
COMMENT ON FUNCTION get_primary_card_color(VARCHAR) IS 'Returns primary color name for a given card';
COMMENT ON VIEW cards_with_colors IS 'View that includes card information with aggregated color data';

-- Виправлення структури кольорів карт
-- Залишити тільки основні кольори та видалити created_at

BEGIN;

-- 1. Очистити неправильні комбінації кольорів
DELETE FROM card_colors_junction 
WHERE color_code NOT IN ('Red', 'Green', 'Blue', 'Purple', 'Yellow', 'Black');

DELETE FROM card_colors 
WHERE code NOT IN ('Red', 'Green', 'Blue', 'Purple', 'Yellow', 'Black');

-- 2. Видалити стовпчик created_at з card_colors
ALTER TABLE card_colors DROP COLUMN IF EXISTS created_at;

-- 3. Перевірити, що залишились тільки основні кольори
SELECT 'Fixed card_colors table:' as status;
SELECT * FROM card_colors ORDER BY code;

-- 4. Показати приклад як працюють junction таблиці
SELECT 'Example: How junction tables work' as info;

-- Показати які кольори має кожна карта (приклад)
SELECT 
    c.base_card_id,
    c.name,
    ARRAY_AGG(cc.name ORDER BY ccj.is_primary DESC, cc.name) as colors,
    (SELECT cc2.name 
     FROM card_colors_junction ccj2 
     JOIN card_colors cc2 ON ccj2.color_code = cc2.code 
     WHERE ccj2.product_id = c.product_id AND ccj2.is_primary = TRUE 
     LIMIT 1) as primary_color
FROM cards c
LEFT JOIN card_colors_junction ccj ON c.product_id = ccj.product_id
LEFT JOIN card_colors cc ON ccj.color_code = cc.code
GROUP BY c.product_id, c.base_card_id, c.name
LIMIT 5;

-- 5. Статистика кольорів
SELECT 'Color usage statistics:' as info;
SELECT 
    cc.code,
    cc.name,
    COUNT(ccj.product_id) as cards_count,
    COUNT(CASE WHEN ccj.is_primary THEN 1 END) as primary_count
FROM card_colors cc
LEFT JOIN card_colors_junction ccj ON cc.code = ccj.color_code
GROUP BY cc.code, cc.name
ORDER BY cards_count DESC;

-- 6. Показати багатокольорові карти
SELECT 'Multi-color cards example:' as info;
SELECT 
    c.base_card_id,
    c.name,
    COUNT(ccj.color_code) as color_count,
    STRING_AGG(cc.name, ' + ' ORDER BY ccj.is_primary DESC, cc.name) as all_colors
FROM cards c
JOIN card_colors_junction ccj ON c.product_id = ccj.product_id
JOIN card_colors cc ON ccj.color_code = cc.code
GROUP BY c.product_id, c.base_card_id, c.name
HAVING COUNT(ccj.color_code) > 1
LIMIT 10;

COMMIT;

-- 7. Показати структуру таблиць для розуміння
\echo '=== TABLE STRUCTURES ==='
\echo 'card_colors (basic colors only):'
\d card_colors

\echo 'card_colors_junction (links cards to multiple colors):'
\d card_colors_junction

\echo 'card_series_junction (links cards to multiple series):'
\d card_series_junction

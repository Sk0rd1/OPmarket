-- One Piece TCG Marketplace - Простой скрипт без сложных блоков
-- Создание пользователей и листингов

BEGIN;

-- 1. Создать таблицу пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    seller_rating DECIMAL(3,2) DEFAULT 0.00,
    total_sales INTEGER DEFAULT 0,
    is_verified_seller BOOLEAN DEFAULT FALSE,
    seller_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Создать таблицу листингов
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES cards(product_id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    condition_code VARCHAR(10) NOT NULL REFERENCES card_conditions(code),
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Создать индексы
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_seller_rating ON users(seller_rating);
CREATE INDEX IF NOT EXISTS idx_listings_product ON listings(product_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_condition ON listings(condition_code);

-- 4. Создать 25 тестовых пользователей-продавцов
INSERT INTO users (username, email, password_hash, seller_rating, total_sales, is_verified_seller) VALUES
('TCGMaster2024', 'tcgmaster@example.com', '$2b$12$hash1', 4.95, 1250, TRUE),
('CardCollector88', 'collector88@example.com', '$2b$12$hash2', 4.88, 890, TRUE),
('OnePieceFan', 'opfan@example.com', '$2b$12$hash3', 4.92, 2100, TRUE),
('MarketplaceKing', 'mpking@example.com', '$2b$12$hash4', 4.87, 756, FALSE),
('CardTrader', 'trader@example.com', '$2b$12$hash5', 4.93, 1890, TRUE),
('PirateCards', 'pirate@example.com', '$2b$12$hash6', 4.91, 1456, TRUE),
('GrandLineShop', 'grandline@example.com', '$2b$12$hash7', 4.89, 2340, TRUE),
('DevilFruitCards', 'devilfruit@example.com', '$2b$12$hash8', 4.86, 678, FALSE),
('StrawHatStore', 'strawhat@example.com', '$2b$12$hash9', 4.94, 1789, TRUE),
('MarineTrader', 'marine@example.com', '$2b$12$hash10', 4.90, 1123, TRUE),
('RookieCollector', 'rookie@example.com', '$2b$12$hash11', 4.85, 567, FALSE),
('LegendaryCards', 'legendary@example.com', '$2b$12$hash12', 4.96, 3200, TRUE),
('NewWorldTCG', 'newworld@example.com', '$2b$12$hash13', 4.88, 899, FALSE),
('EastBlueShop', 'eastblue@example.com', '$2b$12$hash14', 4.91, 1567, TRUE),
('WarlordCards', 'warlord@example.com', '$2b$12$hash15', 4.87, 734, FALSE),
('EmperorTCG', 'emperor@example.com', '$2b$12$hash16', 4.93, 2890, TRUE),
('SupernovaStore', 'supernova@example.com', '$2b$12$hash17', 4.89, 1234, TRUE),
('RevolutionArmy', 'revolution@example.com', '$2b$12$hash18', 4.92, 1678, TRUE),
('WorldGovCards', 'worldgov@example.com', '$2b$12$hash19', 4.86, 890, FALSE),
('FishmanShop', 'fishman@example.com', '$2b$12$hash20', 4.90, 1456, TRUE),
('SkyIslandTCG', 'skyisland@example.com', '$2b$12$hash21', 4.88, 789, FALSE),
('AlabastCards', 'alabasta@example.com', '$2b$12$hash22', 4.91, 1890, TRUE),
('DrumIslandShop', 'drumisland@example.com', '$2b$12$hash23', 4.87, 567, FALSE),
('WaterSevenTCG', 'waterseven@example.com', '$2b$12$hash24', 4.94, 2456, TRUE),
('ThrillerBarkTCG', 'thrillerbark@example.com', '$2b$12$hash25', 4.89, 1123, TRUE)
ON CONFLICT (username) DO NOTHING;

-- 5. Создать временную таблицу с популярными картами
CREATE TEMP TABLE popular_cards AS
SELECT 
    c.product_id, 
    c.base_card_id, 
    c.name, 
    COALESCE(c.rarity, 'C') as rarity,
    COALESCE(c.is_alternate_art, FALSE) as is_alternate_art,
    ROW_NUMBER() OVER (ORDER BY 
        CASE COALESCE(c.rarity, 'C')
            WHEN 'SEC' THEN 1 
            WHEN 'SR' THEN 2 
            ELSE 3 
        END,
        COALESCE(c.is_alternate_art, FALSE) DESC,
        c.name
    ) as rank
FROM cards c 
WHERE COALESCE(c.rarity, 'C') IN ('SEC', 'SR');

-- 6. Создать листинги для ТОП-5 карт (по 25 продавцов каждой карте)
-- Карта #1 - 25 продавцов
INSERT INTO listings (product_id, seller_id, condition_code, price, quantity, description)
SELECT 
    pc.product_id,
    u.id,
    CASE (u.row_num % 4)
        WHEN 0 THEN 'M'
        WHEN 1 THEN 'NM' 
        WHEN 2 THEN 'MP'
        ELSE 'HP'
    END,
    ROUND((
        CASE pc.rarity WHEN 'SEC' THEN 180 WHEN 'SR' THEN 55 ELSE 12 END *
        CASE pc.is_alternate_art WHEN TRUE THEN 1.6 ELSE 1.0 END *
        CASE (u.row_num % 4)
            WHEN 0 THEN 1.15
            WHEN 1 THEN 1.0
            WHEN 2 THEN 0.85
            ELSE 0.65
        END *
        (0.85 + random() * 0.3)
    )::DECIMAL(10,2), 2),
    CASE WHEN u.row_num <= 20 THEN 1 ELSE 2 END,
    CASE pc.is_alternate_art WHEN TRUE THEN 'Gorgeous alternate art! ' ELSE '' END ||
    CASE (u.row_num % 4)
        WHEN 0 THEN 'Perfect mint condition!'
        WHEN 1 THEN 'Near mint with minimal wear.'
        WHEN 2 THEN 'Moderately played, good condition.'
        ELSE 'Heavily played but tournament legal.'
    END ||
    CASE pc.rarity WHEN 'SEC' THEN ' Ultra rare SECRET!' WHEN 'SR' THEN ' Super rare!' ELSE '' END
FROM popular_cards pc
CROSS JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY seller_rating DESC) as row_num FROM users LIMIT 25) u
WHERE pc.rank = 1;

-- Карта #2 - 25 продавцов
INSERT INTO listings (product_id, seller_id, condition_code, price, quantity, description)
SELECT 
    pc.product_id,
    u.id,
    CASE (u.row_num % 4)
        WHEN 0 THEN 'M'
        WHEN 1 THEN 'NM' 
        WHEN 2 THEN 'MP'
        ELSE 'HP'
    END,
    ROUND((
        CASE pc.rarity WHEN 'SEC' THEN 180 WHEN 'SR' THEN 55 ELSE 12 END *
        CASE pc.is_alternate_art WHEN TRUE THEN 1.6 ELSE 1.0 END *
        CASE (u.row_num % 4)
            WHEN 0 THEN 1.15
            WHEN 1 THEN 1.0
            WHEN 2 THEN 0.85
            ELSE 0.65
        END *
        (0.85 + random() * 0.3)
    )::DECIMAL(10,2), 2),
    CASE WHEN u.row_num <= 20 THEN 1 ELSE 2 END,
    CASE pc.is_alternate_art WHEN TRUE THEN 'Gorgeous alternate art! ' ELSE '' END ||
    CASE (u.row_num % 4)
        WHEN 0 THEN 'Perfect mint condition!'
        WHEN 1 THEN 'Near mint with minimal wear.'
        WHEN 2 THEN 'Moderately played, good condition.'
        ELSE 'Heavily played but tournament legal.'
    END ||
    CASE pc.rarity WHEN 'SEC' THEN ' Ultra rare SECRET!' WHEN 'SR' THEN ' Super rare!' ELSE '' END
FROM popular_cards pc
CROSS JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY seller_rating DESC) as row_num FROM users LIMIT 25) u
WHERE pc.rank = 2;

-- Карта #3 - 25 продавцов
INSERT INTO listings (product_id, seller_id, condition_code, price, quantity, description)
SELECT 
    pc.product_id,
    u.id,
    CASE (u.row_num % 4)
        WHEN 0 THEN 'M'
        WHEN 1 THEN 'NM' 
        WHEN 2 THEN 'MP'
        ELSE 'HP'
    END,
    ROUND((
        CASE pc.rarity WHEN 'SEC' THEN 180 WHEN 'SR' THEN 55 ELSE 12 END *
        CASE pc.is_alternate_art WHEN TRUE THEN 1.6 ELSE 1.0 END *
        CASE (u.row_num % 4)
            WHEN 0 THEN 1.15
            WHEN 1 THEN 1.0
            WHEN 2 THEN 0.85
            ELSE 0.65
        END *
        (0.85 + random() * 0.3)
    )::DECIMAL(10,2), 2),
    CASE WHEN u.row_num <= 20 THEN 1 ELSE 2 END,
    CASE pc.is_alternate_art WHEN TRUE THEN 'Gorgeous alternate art! ' ELSE '' END ||
    CASE (u.row_num % 4)
        WHEN 0 THEN 'Perfect mint condition!'
        WHEN 1 THEN 'Near mint with minimal wear.'
        WHEN 2 THEN 'Moderately played, good condition.'
        ELSE 'Heavily played but tournament legal.'
    END ||
    CASE pc.rarity WHEN 'SEC' THEN ' Ultra rare SECRET!' WHEN 'SR' THEN ' Super rare!' ELSE '' END
FROM popular_cards pc
CROSS JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY seller_rating DESC) as row_num FROM users LIMIT 25) u
WHERE pc.rank = 3;

-- Карта #4 - 25 продавцов
INSERT INTO listings (product_id, seller_id, condition_code, price, quantity, description)
SELECT 
    pc.product_id,
    u.id,
    CASE (u.row_num % 4)
        WHEN 0 THEN 'M'
        WHEN 1 THEN 'NM' 
        WHEN 2 THEN 'MP'
        ELSE 'HP'
    END,
    ROUND((
        CASE pc.rarity WHEN 'SEC' THEN 180 WHEN 'SR' THEN 55 ELSE 12 END *
        CASE pc.is_alternate_art WHEN TRUE THEN 1.6 ELSE 1.0 END *
        CASE (u.row_num % 4)
            WHEN 0 THEN 1.15
            WHEN 1 THEN 1.0
            WHEN 2 THEN 0.85
            ELSE 0.65
        END *
        (0.85 + random() * 0.3)
    )::DECIMAL(10,2), 2),
    CASE WHEN u.row_num <= 20 THEN 1 ELSE 2 END,
    CASE pc.is_alternate_art WHEN TRUE THEN 'Gorgeous alternate art! ' ELSE '' END ||
    CASE (u.row_num % 4)
        WHEN 0 THEN 'Perfect mint condition!'
        WHEN 1 THEN 'Near mint with minimal wear.'
        WHEN 2 THEN 'Moderately played, good condition.'
        ELSE 'Heavily played but tournament legal.'
    END ||
    CASE pc.rarity WHEN 'SEC' THEN ' Ultra rare SECRET!' WHEN 'SR' THEN ' Super rare!' ELSE '' END
FROM popular_cards pc
CROSS JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY seller_rating DESC) as row_num FROM users LIMIT 25) u
WHERE pc.rank = 4;

-- Карта #5 - 25 продавцов
INSERT INTO listings (product_id, seller_id, condition_code, price, quantity, description)
SELECT 
    pc.product_id,
    u.id,
    CASE (u.row_num % 4)
        WHEN 0 THEN 'M'
        WHEN 1 THEN 'NM' 
        WHEN 2 THEN 'MP'
        ELSE 'HP'
    END,
    ROUND((
        CASE pc.rarity WHEN 'SEC' THEN 180 WHEN 'SR' THEN 55 ELSE 12 END *
        CASE pc.is_alternate_art WHEN TRUE THEN 1.6 ELSE 1.0 END *
        CASE (u.row_num % 4)
            WHEN 0 THEN 1.15
            WHEN 1 THEN 1.0
            WHEN 2 THEN 0.85
            ELSE 0.65
        END *
        (0.85 + random() * 0.3)
    )::DECIMAL(10,2), 2),
    CASE WHEN u.row_num <= 20 THEN 1 ELSE 2 END,
    CASE pc.is_alternate_art WHEN TRUE THEN 'Gorgeous alternate art! ' ELSE '' END ||
    CASE (u.row_num % 4)
        WHEN 0 THEN 'Perfect mint condition!'
        WHEN 1 THEN 'Near mint with minimal wear.'
        WHEN 2 THEN 'Moderately played, good condition.'
        ELSE 'Heavily played but tournament legal.'
    END ||
    CASE pc.rarity WHEN 'SEC' THEN ' Ultra rare SECRET!' WHEN 'SR' THEN ' Super rare!' ELSE '' END
FROM popular_cards pc
CROSS JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY seller_rating DESC) as row_num FROM users LIMIT 25) u
WHERE pc.rank = 5;

-- 7. Создать листинги для других популярных карт (5-15 продавцов)
INSERT INTO listings (product_id, seller_id, condition_code, price, quantity, description)
SELECT 
    c.product_id,
    u.id,
    CASE 
        WHEN random() < 0.3 THEN 'M'
        WHEN random() < 0.6 THEN 'NM'
        WHEN random() < 0.85 THEN 'MP'
        ELSE 'HP'
    END,
    ROUND((
        CASE COALESCE(c.rarity, 'C')
            WHEN 'SEC' THEN 150 + (random() * 200)
            WHEN 'SR' THEN 30 + (random() * 80)
            WHEN 'R' THEN 8 + (random() * 25)
            WHEN 'L' THEN 20 + (random() * 40)
            ELSE 1 + (random() * 8)
        END *
        CASE WHEN COALESCE(c.is_alternate_art, FALSE) THEN 1.5 ELSE 1.0 END
    )::DECIMAL(10,2), 2),
    CASE WHEN random() < 0.7 THEN 1 ELSE 2 END,
    CASE WHEN COALESCE(c.is_alternate_art, FALSE) THEN 'Beautiful alternate art! ' ELSE '' END ||
    CASE COALESCE(c.rarity, 'C')
        WHEN 'SEC' THEN 'Extremely rare SECRET card!'
        WHEN 'SR' THEN 'Super rare card - high value!'
        WHEN 'R' THEN 'Rare card for competitive play.'
        ELSE 'Great card for your collection.'
    END
FROM cards c
CROSS JOIN (SELECT id FROM users ORDER BY random() LIMIT 8) u
WHERE c.product_id NOT IN (SELECT DISTINCT product_id FROM listings)
AND (
    COALESCE(c.rarity, 'C') IN ('SR', 'R', 'L') OR 
    COALESCE(c.card_type_detail, '') LIKE '%Leader%' OR
    COALESCE(c.is_alternate_art, FALSE) = TRUE
)
AND random() < 0.15;

-- 8. Создать листинги для обычных карт (1-3 продавца)
INSERT INTO listings (product_id, seller_id, condition_code, price, quantity, description)
SELECT 
    c.product_id,
    u.id,
    CASE 
        WHEN random() < 0.3 THEN 'NM'
        WHEN random() < 0.6 THEN 'MP'
        WHEN random() < 0.85 THEN 'M'
        ELSE 'HP'
    END,
    ROUND((
        CASE COALESCE(c.rarity, 'C')
            WHEN 'R' THEN 3 + (random() * 12)
            WHEN 'L' THEN 8 + (random() * 20)
            ELSE 0.25 + (random() * 4)
        END
    )::DECIMAL(10,2), 2),
    CASE WHEN random() < 0.8 THEN 1 ELSE 2 END,
    CASE 
        WHEN COALESCE(c.card_type_detail, '') LIKE '%Leader%' THEN 'Great leader card!'
        WHEN COALESCE(c.card_type_detail, '') LIKE '%Character%' THEN 'Solid character card.'
        ELSE 'Perfect for collectors.'
    END
FROM cards c
CROSS JOIN (SELECT id FROM users ORDER BY random() LIMIT 3) u
WHERE c.product_id NOT IN (SELECT DISTINCT product_id FROM listings)
AND random() < 0.08;

-- 9. Обновить статистику пользователей
UPDATE users 
SET total_sales = subquery.listing_count
FROM (
    SELECT seller_id, COUNT(*) as listing_count
    FROM listings 
    GROUP BY seller_id
) subquery
WHERE users.id = subquery.seller_id;

COMMIT;

-- 10. РЕЗУЛЬТАТЫ
\echo '=== MARKETPLACE STATISTICS ==='

SELECT 
    'MARKETPLACE CREATED SUCCESSFULLY!' as status,
    (SELECT COUNT(*) FROM listings) as total_listings,
    (SELECT COUNT(DISTINCT seller_id) FROM listings) as active_sellers,
    (SELECT COUNT(DISTINCT product_id) FROM listings) as products_for_sale,
    (SELECT COUNT(*) FROM cards) as total_cards_in_db;

\echo '=== TOP CARDS BY SELLER COUNT ==='

SELECT 
    c.base_card_id,
    c.name,
    COALESCE(c.rarity, 'C') as rarity,
    COALESCE(c.is_alternate_art, FALSE) as is_alt_art,
    COUNT(DISTINCT l.seller_id) as seller_count,
    COUNT(l.id) as total_listings,
    MIN(l.price) as min_price,
    MAX(l.price) as max_price,
    ROUND(AVG(l.price), 2) as avg_price
FROM cards c
JOIN listings l ON c.product_id = l.product_id
WHERE l.is_active = TRUE
GROUP BY c.product_id, c.base_card_id, c.name, c.rarity, c.is_alternate_art
ORDER BY seller_count DESC, total_listings DESC
LIMIT 10;

-- 11. Создать VIEW для маркетплейса
CREATE OR REPLACE VIEW marketplace_view AS
SELECT 
    l.id as listing_id,
    c.base_card_id,
    c.name as card_name,
    COALESCE(c.rarity, 'C') as rarity,
    COALESCE(c.card_type_detail, 'Unknown') as card_type,
    COALESCE(c.is_alternate_art, FALSE) as is_alternate_art,
    c.series_name,
    l.condition_code,
    cc.name as condition_name,
    l.price,
    l.quantity,
    l.description,
    u.username as seller,
    u.seller_rating,
    u.is_verified_seller,
    l.created_at,
    l.is_active
FROM listings l
JOIN cards c ON l.product_id = c.product_id
JOIN users u ON l.seller_id = u.id
JOIN card_conditions cc ON l.condition_code = cc.code
WHERE l.is_active = TRUE
ORDER BY 
    CASE COALESCE(c.rarity, 'C')
        WHEN 'SEC' THEN 1 
        WHEN 'SR' THEN 2 
        WHEN 'R' THEN 3
        WHEN 'L' THEN 4
        ELSE 5 
    END,
    l.price DESC;

\echo '=== SETUP COMPLETE ==='
\echo 'Use: SELECT * FROM marketplace_view LIMIT 10; to see your marketplace!'

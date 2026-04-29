 -- 1. Database Initialization
-- CREATE DATABASE IF NOT EXISTS Offer_db;
USE Offer_db;

-- -- 2. Admin Table
-- CREATE TABLE admin (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(60) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 3. Categories Table
-- CREATE TABLE categories (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL UNIQUE,
--     description TEXT
-- );

-- -- 4. Users Table
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(60) NOT NULL,
--     location VARCHAR(255),
--     status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved', -- Defaulted to approved for easier testing
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 5. Shop Owners Table
-- CREATE TABLE shop_owners (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(60) NOT NULL,
--     shop_name VARCHAR(150) NOT NULL,
--     location VARCHAR(255) NOT NULL,
--     category_id INT,
--     logo_url VARCHAR(255) DEFAULT NULL,
--     status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
--     is_approved BOOLEAN DEFAULT TRUE, -- Matches your previous logic
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
-- );

-- -- 6. Offers Table
-- CREATE TABLE offers (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     shop_id INT NOT NULL,
--     title VARCHAR(200) NOT NULL,
--     description TEXT,
--     discount_details VARCHAR(255) NOT NULL,
--     image_url VARCHAR(255) DEFAULT NULL,
--     valid_until DATETIME NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (shop_id) REFERENCES shop_owners(id) ON DELETE CASCADE
-- );

-- -- 7. Claims Table
-- CREATE TABLE claims (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     offer_id INT NOT NULL,
--     coupon_code VARCHAR(100) UNIQUE NOT NULL,
--     claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     is_redeemed BOOLEAN DEFAULT FALSE,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
-- );


-- 
-- INSERT INTO offers (shop_id, title, discount_details, description, valid_until, image_url) VALUES 
-- (6, 'S-Series Pre-book', 'Free Buds', 'Pre-book the latest Galaxy S series phone and get Galaxy Buds Pro free.', '2026-05-30 23:59:00', NULL),
-- (6, 'Bespoke Refrigerator', '20% OFF', '20% off on customizable Bespoke series refrigerators.', '2026-07-31 23:59:00', NULL),
-- (6, 'Student Tablet Deal', '15% OFF', '15% off on the Galaxy Tab S series for verified university students.', '2026-09-30 23:59:00', NULL),
-- (6, 'Smart Monitor Combo', '₹2500 OFF', 'Save ₹2500 on the Samsung Smart Monitor M8 when bought with a keyboard.', '2026-08-15 23:59:00', NULL),
-- (6, 'Watch Upgrade', '₹1500 Bonus', 'Exchange any old smartwatch for a ₹1500 bonus on the new Galaxy Watch.', '2026-06-20 23:59:00', NULL),
-- (7, 'Back to School', 'Free AirPods', 'Buy an eligible Mac or iPad with education pricing and get AirPods free.', '2026-09-30 23:59:00', NULL),
-- (7, 'Trade-In Boost', 'Extra ₹3000', 'Get an extra ₹3000 trade-in value when upgrading from iPhone 12 or older.', '2026-07-31 23:59:00', NULL),
-- (7, 'AppleCare+ Promo', '20% OFF', '20% off AppleCare+ when purchased together with a new MacBook Pro.', '2026-08-30 23:59:00', NULL),
-- (7, 'Accessory Bundle', '10% OFF', '10% off when you buy an official iPhone case and MagSafe charger together.', '2026-06-15 23:59:00', NULL),
-- (7, 'Watch Band Event', 'Buy 2 Get 1', 'Buy any two Apple Watch bands and get a third of equal or lesser value free.', '2026-05-30 23:59:00', NULL);

-- INSERT INTO offers (shop_id, title, discount_details, description, valid_until, image_url) VALUES 
-- (8, 'Midweek Madness', 'BOGO', 'Buy one medium or large pizza, get another of equal/lesser value free.', '2026-12-31 23:59:00', NULL),
-- (8, 'Late Night Craving', '20% OFF', '20% off on all delivery orders placed between 11 PM and 3 AM.', '2026-08-30 23:59:00', NULL),
-- (8, 'Garlic Bread Add-on', 'Free Side', 'Get free stuffed Garlic Breadsticks on orders above ₹500.', '2026-07-15 23:59:00', NULL),
-- (8, 'Weekend Family Feast', 'Flat ₹200 OFF', 'Flat ₹200 off on a minimum order value of ₹999. Valid Saturday and Sunday.', '2026-06-25 23:59:00', NULL),
-- (8, 'App First Order', '50% OFF', '50% off up to ₹100 on your first order via the Offer.com app.', '2026-12-31 23:59:00', NULL),
-- (9, 'Triple Treat Box', '₹150 OFF', 'Save ₹150 on the Triple Treat Box. Perfect for game nights.', '2026-06-30 23:59:00', NULL),
-- (9, 'Lunch Special', '₹99 Pizzas', 'Select personal pan pizzas starting at just ₹99 from 11 AM to 3 PM.', '2026-07-31 23:59:00', NULL),
-- (9, 'Crust Upgrade', 'Free Upgrade', 'Upgrade to a Cheese Maxx stuffed crust for free on any large pizza.', '2026-08-20 23:59:00', NULL),
-- (9, 'Dessert Deal', 'Free Volcano', 'Free Choco Volcano cake on orders exceeding ₹600.', '2026-09-10 23:59:00', NULL),
-- (9, 'Momo Mia Special', '10% OFF', 'Try the new Momo Mia pizza and get 10% off your total bill.', '2026-06-15 23:59:00', NULL),
-- (10, 'Giant Pizza Day', 'BOGO', 'Buy 1 Get 1 Free on all Giant and Monster sized pizzas every Wednesday.', '2026-12-31 23:59:00', NULL),
-- (10, 'Mac & Cheese Offer', 'Free Pasta', 'Get a free Mac & Cheese pasta with any large premium pizza purchase.', '2026-05-30 23:59:00', NULL),
-- (10, 'Party Order Discount', '25% OFF', 'Flat 25% off on bulk delivery orders over ₹2000.', '2026-08-31 23:59:00', NULL),
-- (10, 'Taco Craving', 'Buy 2 Get 1', 'Buy any two pizza tacos and get the third one absolutely free.', '2026-07-20 23:59:00', NULL),
-- (10, 'Student Slice', '15% OFF', 'Show your college ID and get 15% off any individual pizza slice and drink combo.', '2026-09-30 23:59:00', NULL),
-- (11, 'Sunday Brunch', '1 + 1 Buffet', '1+1 on Sunday Grand Brunch Buffet. Advance reservation required.', '2026-07-31 23:59:00', NULL),
-- (11, 'Corporate Lunch', '20% OFF', 'Show your corporate ID for 20% off on your table''s total lunch bill.', '2026-08-30 23:59:00', NULL),
-- (11, 'Free Dessert', 'Free Dessert', 'Complimentary chef''s special dessert per person for tables of 4 or more.', '2026-06-15 23:59:00', NULL),
-- (11, 'Dinner Under Stars', '₹500 OFF', '₹500 off the total bill for rooftop dining after 8 PM. Min spend ₹2500.', '2026-05-20 23:59:00', NULL),
-- (11, 'Wine & Dine', '15% OFF Drinks', '15% off on all mocktails and beverages when ordered with a main course.', '2026-07-10 23:59:00', NULL),
-- (12, 'Wednesday Bucket', 'Flat 30% OFF', 'Flat 30% off on the 12-piece Hot & Crispy bucket every Wednesday.', '2026-12-31 23:59:00', NULL),
-- (12, 'Zinger Combo', 'Free Fries', 'Get a free medium fries with the purchase of any Zinger Burger.', '2026-06-30 23:59:00', NULL),
-- (12, 'Snack Time', '₹99 Store', 'Any item from the snack menu for just ₹99 between 4 PM and 7 PM.', '2026-07-31 23:59:00', NULL),
-- (12, 'Family Feast', 'Free Pepsi', 'Get a complimentary 1L Pepsi with the Ultimate Family Feast Bucket.', '2026-08-15 23:59:00', NULL),
-- (12, 'Chicken Roll Deal', 'Buy 2 Get 1', 'Buy two chicken rolls and get one veg or chicken roll free.', '2026-09-20 23:59:00', NULL),
-- (13, 'Taco Tuesday', '50% OFF', 'Get 50% off all Crunchy and Soft Tacos every Tuesday.', '2026-12-31 23:59:00', NULL),
-- (13, 'Naked Chicken Meal', 'Free Drink', 'Free unlimited beverage refill with any Naked Chicken Taco meal.', '2026-05-30 23:59:00', NULL),
-- (13, 'Chalupa Craving', 'Buy 1 Get 1', 'BOGO on all Chalupas. Valid for Dine-in and Takeaway only.', '2026-07-15 23:59:00', NULL),
-- (13, 'Party Pack Deal', '₹100 OFF', 'Flat ₹100 off on the Big Bell Party Pack.', '2026-08-25 23:59:00', NULL),
-- (13, 'Cheesy Fries Add-on', '₹50 Upgrade', 'Add loaded cheesy fries to any meal combo for just an extra ₹50.', '2026-05-30 23:59:00', NULL);

-- INSERT INTO categories (name, description) VALUES 
-- ('Electronics', 'Gadgets, appliances, laptops, and smartphones'),
-- ('Food & Beverage', 'Restaurants, fast food, cafes, and bakeries');

-- SELECT * FROM offers;
-- select * from shop_owners;
-- select * from categories;
-- SELECT * FROM admin;
-- SELECT * FROM claims;
-- SELECT * FROM users;

-- ALTER TABLE users DROP COLUMN status;
ALTER TABLE admin MODIFY COLUMN password_hash VARCHAR(100);
ALTER TABLE admin MODIFY COLUMN email VARCHAR(25);
ALTER TABLE admin MODIFY COLUMN username VARCHAR(25);



-- UPDATE shop_owners  SET category_id = 1 WHERE id IN (3, 4, 5, 6, 7);

-- 2. Set Domino's, Pizza Hut, La Pinoz, Terracotta, KFC, and Taco Bell to 'Food & Beverage' (Category ID 2)
-- UPDATE shop_owners SET category_id = 2 WHERE id IN (8, 9, 10, 11, 12, 13);


-- INSERT INTO admin (username, email, password_hash) 
-- VALUES ('Super Admin', 'admin@offer.com', '$2b$10$vgb5cG0nCevPR.n.GmSDt.VkwYWFbyunwlxXHlLxSi7ykJPAzC7ta');
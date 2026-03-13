-- -- 1. Create the Database
-- -- CREATE DATABASE Offer_com_db;
USE Offer_db;
    
-- -- 2. Admin Table (Independent)
-- CREATE TABLE admin (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 3. Categories Table (Independent - e.g., "Food", "Electronics")
-- CREATE TABLE categories (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL UNIQUE,
--     description TEXT
-- );

-- -- 4. Users Table (Independent)
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     location VARCHAR(255), -- Used to filter local offers
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 5. Shop Owners Table (Depends on Categories)
-- CREATE TABLE shop_owners (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     shop_name VARCHAR(150) NOT NULL,
--     location VARCHAR(255) NOT NULL,
--     category_id INT,
--     is_approved BOOLEAN DEFAULT FALSE, -- Admin must approve
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
-- );

-- -- 6. Offers Table (Depends on Shop Owners)
-- CREATE TABLE offers (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     shop_id INT NOT NULL,
--     title VARCHAR(200) NOT NULL,
--     description TEXT,
--     discount_details VARCHAR(255) NOT NULL, -- e.g., "20% Off", "$10 Off"
--     valid_until DATETIME NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (shop_id) REFERENCES shop_owners(id) ON DELETE CASCADE
-- );

-- -- 7. Claims Table (Depends on Users and Offers)
-- CREATE TABLE claims (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     offer_id INT NOT NULL,
--     coupon_code VARCHAR(100) UNIQUE NOT NULL, -- Unique code generated on claim
--     claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     is_redeemed BOOLEAN DEFAULT FALSE, -- Track if they actually used it at the shop
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
-- );

-- SELECT * FROM shop_owners;

-- ALTER TABLE users ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
-- ALTER TABLE shop_owners ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';

-- -- Automatically approve accounts you already created:
-- UPDATE users SET status = 'approved';
-- UPDATE shop_owners SET status = 'approved';

 -- Add image_url to offers table to store the URL of the offer's image
-- ALTER TABLE offers ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;

-- ALTER TABLE shop_owners ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL;
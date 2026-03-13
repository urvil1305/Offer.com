-- 1. Database Initialization
CREATE DATABASE IF NOT EXISTS Offer_db;
USE Offer_db;

-- 2. Admin Table
CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- 4. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    location VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved', -- Defaulted to approved for easier testing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Shop Owners Table
CREATE TABLE shop_owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    shop_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category_id INT,
    logo_url VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    is_approved BOOLEAN DEFAULT TRUE, -- Matches your previous logic
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 6. Offers Table
CREATE TABLE offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    discount_details VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    valid_until DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shop_owners(id) ON DELETE CASCADE
);

-- 7. Claims Table
CREATE TABLE claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    offer_id INT NOT NULL,
    coupon_code VARCHAR(100) UNIQUE NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_redeemed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);

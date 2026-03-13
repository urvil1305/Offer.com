🚀 Offer.com - Local Setup Guide

Welcome to the Offer.com project repository! This guide will walk you through setting up the frontend, backend, and database so you can run the application on your local machine.
📋 Prerequisites

  Before you begin, ensure you have the following installed on your PC:
  Node.js (v16 or higher)
  MySQL Server & MySQL Workbench (or XAMPP if you prefer phpMyAdmin)
  Git (to clone/pull the code)
  
🗄️ Step 1: Database Setup (MySQL)
  The application requires a MySQL database to store users, shops, and offers.
  1. Open MySQL Workbench (or your preferred database manager).
  2. Create a new database called Offer_db by running this command:
      SQL
     
          CREATE DATABASE Offer_db;
          USE Offer_db;
  4. Run the following SQL script to create the necessary tables exactly as the backend expects them:

      SQL
     
          -- Create Users Table
          CREATE TABLE users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              location VARCHAR(255),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
     
          -- Create Shop Owners Table
          CREATE TABLE shop_owners (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              shop_name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              location VARCHAR(255),
              logo_url VARCHAR(255) DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Create Offers Table
          CREATE TABLE offers (
              id INT AUTO_INCREMENT PRIMARY KEY,
              shop_id INT NOT NULL,
              title VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              discount_details VARCHAR(255) NOT NULL,
              valid_until DATE NOT NULL,
              image_url VARCHAR(255) DEFAULT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (shop_id) REFERENCES shop_owners(id) ON DELETE CASCADE
          );
          -- Create Claims Table (For users claiming offers)
          CREATE TABLE claims (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              offer_id INT NOT NULL,
              coupon_code VARCHAR(50) NOT NULL,
              claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
          );

⚙️ Step 2: Backend Setup (Node.js/Express)
    
  The backend handles the API, database connections, and image uploads (Multer).
  1. Open your terminal or command prompt.
  2. Navigate into the backend folder:
        Bash
     
          cd path/to/project/backend
  3. Install all the required Node dependencies:
        Bash
     
          npm install
  4. Environment Variables: Create a file named .env in the root of the backend folder and add your database credentials. Make sure the password matches your local MySQL setup!

          Code snippet
          PORT=5000
          DB_HOST=127.0.0.1
          DB_USER=root
          DB_PASSWORD=your_mysql_password_here
          DB_NAME=Offer_db
          JWT_SECRET=super_secret_key_for_offer_com
  5. Start the backend server:
        Bash
     
          npm run dev

  (You should see green text in the terminal saying: Server is running on http://localhost:5000 and ✅ Database connected successfully to Offer_db!)

💻 Step 3: Frontend Setup (React/Vite)
    The frontend is built with React, Tailwind CSS, and React Router.
    1. Open a new, second terminal window (leave the backend running in the first one!).
    2. Navigate into the frontend folder:
      Bash
      
        cd path/to/project/frontend
  3. Install the frontend dependencies:
      Bash
       
         npm install
     
  5. Start the React development server:
      Bash
     
          npm run dev
  
  (The terminal will provide a local link, usually http://localhost:5173)

🎉 Step 4: You're Ready!
  1. Open your web browser and go to http://localhost:5173.
  2. You should see the beautiful Dark Mode landing page!
  3. To test the app:
      Go to "Sign Up" and create a Business Account (don't forget to upload a logo!).
      Log in to the Business account, go to the Shop Portal, and post an offer with an image.
      Log out, create a Personal Account, and try claiming the deal you just posted!
     
🛑 Troubleshooting Notes for the Team
    Images not showing? Make sure there is an uploads folder inside the backend directory. If Multer doesn't create it automatically, simply right-click and create an empty folder named uploads inside the backend.
    Database Crashes? Double-check that your MySQL .env password is correct, and that MySQL server is actively running in the background of your PC.


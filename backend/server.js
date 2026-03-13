// backend/server.js
require('dotenv').config();
const express = require('express'); // The core Express framework for building the API
const cors = require('cors'); // This allows your React frontend to communicate with this API without CORS issues
const adminRoutes = require('./routes/adminRoutes'); // Import the admin routes
const db = require('./config/db'); // This imports and runs your connection test
const path = require('path'); // <-- Import path module


// Import the auth routes and offer routes
const authRoutes = require('./routes/authRoutes'); // Import the auth routes (for registration and login)
const offerRoutes = require('./routes/offerRoutes'); // Import the offer routes
const claimRoutes = require('./routes/claimRoutes'); // Import the claim routes

const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to communicate with this API
app.use(express.json()); // Allows Express to parse JSON data in request bodies

// --- NEW: Serve the uploads folder so React can load the images ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// A simple test route
app.get('/', (req, res) => {
    res.send('Welcome to the Offer.com API!');
});

// Tell Express to use the auth routes for any URL starting with /api/auth or /api/offers
app.use('/api/auth', authRoutes); // This will handle all authentication-related routes under /api/auth
app.use('/api/offers', offerRoutes); // This will handle all offer-related routes under /api/offers
app.use('/api/claims', claimRoutes);  // This will handle all claim-related routes under /api/claims
app.use('/api/admin', adminRoutes); // This will handle all admin-related routes under /api/admin

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
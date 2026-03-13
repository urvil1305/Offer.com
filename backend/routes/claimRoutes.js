// backend/routes/claimRoutes.js
const express = require('express');
const router = express.Router();
const { claimOffer, getUserClaims } = require('../controllers/claimController');
const verifyToken = require('../middleware/authMiddleware'); // Bring in the bouncer!

// Fetch a user's claims
router.get('/my-claims', verifyToken, getUserClaims);

// POST /api/claims/:offer_id 
// (The :offer_id is a dynamic parameter so users can claim different offers)
router.post('/:offer_id', verifyToken, claimOffer);

module.exports = router;
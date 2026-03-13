// backend/controllers/claimController.js
const db = require('../config/db');

const claimOffer = async (req, res) => {
    try {
        // 1. Ensure only regular users can claim offers (no shop owners allowed!)
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only registered users can claim offers.' });
        }

        const { offer_id } = req.params; // We will pass the offer ID in the URL
        const user_id = req.user.id;     // We get this securely from the JWT token

        // 2. Check if the offer exists and hasn't expired
        const [offers] = await db.execute('SELECT * FROM offers WHERE id = ? AND valid_until > NOW()', [offer_id]);
        if (offers.length === 0) {
            return res.status(404).json({ message: 'Offer not found or has expired.' });
        }

        // 3. Check if this specific user has already claimed this specific offer
        const [existingClaims] = await db.execute('SELECT * FROM claims WHERE user_id = ? AND offer_id = ?', [user_id, offer_id]);
        if (existingClaims.length > 0) {
            return res.status(400).json({ message: 'You have already claimed this offer.' });
        }

        // 4. Generate a unique, random 6-character coupon code (e.g., OFF-X7B9A2)
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const coupon_code = `OFF-${randomString}`;

        // 5. Save the claim to the database
        await db.execute(
            'INSERT INTO claims (user_id, offer_id, coupon_code) VALUES (?, ?, ?)',
            [user_id, offer_id, coupon_code]
        );

        res.status(201).json({ 
            message: 'Offer claimed successfully!', 
            coupon_code: coupon_code 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while claiming offer' });
    }
};

const getUserClaims = async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from the JWT token
        
        // We use a JOIN to get the coupon code, plus the offer details and shop name
        const query = `
            SELECT 
                claims.coupon_code, 
                claims.claimed_at,
                offers.title, 
                offers.discount_details, 
                offers.valid_until,
                shop_owners.shop_name
            FROM claims
            JOIN offers ON claims.offer_id = offers.id
            JOIN shop_owners ON offers.shop_id = shop_owners.id
            WHERE claims.user_id = ?
            ORDER BY claims.claimed_at DESC
        `;
        
        const [claims] = await db.execute(query, [userId]);
        res.status(200).json(claims);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching claims' });
    }
};

module.exports = { claimOffer, getUserClaims };
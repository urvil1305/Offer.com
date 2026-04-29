// backend/controllers/offerController.js
const db = require('../config/db');

// --- CREATE AN OFFER ---
const createOffer = async (req, res) => {
    // --- NEW: Print exactly what the server is receiving! ---
    console.log("Data received:", req.body);
    console.log("File received:", req.file);
    
    try {
        const { title, description, discount_details, valid_until } = req.body;
        
        // THIS IS THE MISSING LINE! It gets the shop's ID from their secure token.
        const shopId = req.user.id; 
        
        // Grab the file path if an image was uploaded
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Insert everything into the database, including the shopId and imageUrl
        const [result] = await db.execute(
            'INSERT INTO offers (shop_id, title, description, discount_details, valid_until, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [shopId, title, description, discount_details, valid_until, imageUrl]
        );

        res.status(201).json({ message: 'Offer created successfully!', offerId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating offer' });
    }
};


// --- GET ALL ACTIVE OFFERS (Discovery Route) ---
const getAllOffers = async (req, res) => {
    try {
        // --- NEW: AUTO-DELETE EXPIRED OFFERS ---
        await db.execute('DELETE FROM offers WHERE valid_until < NOW()');

      const [rows] = await db.execute(`
            SELECT offers.*, shop_owners.name AS shop_name, shop_owners.location, categories.name AS category_name 
            FROM offers 
            JOIN shop_owners ON offers.shop_id = shop_owners.id 
            LEFT JOIN categories ON shop_owners.category_id = categories.id
            WHERE offers.valid_until >= NOW()
            ORDER BY offers.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching offers' });
    }
};

const deleteOffer = async (req, res) => {
    try {
        const offerId = req.params.id; // The ID of the offer to delete from the URL
        const shopId = req.user.id;    // The ID of the logged-in shop owner from the token

        // SECURITY CHECK: We use AND shop_id = ? to guarantee they can only delete their OWN offers!
        const [result] = await db.execute('DELETE FROM offers WHERE id = ? AND shop_id = ?', [offerId, shopId]);

        // If affectedRows is 0, it means the offer didn't exist OR they didn't own it
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Cannot delete: You can only delete your own offers!' });
        }

        res.status(200).json({ message: 'Offer deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting offer' });
    }
};

// --- NEW: GET A SPECIFIC SHOP'S OFFERS ---
const getShopOffers = async (req, res) => {
    try {
        // --- NEW: AUTO-DELETE EXPIRED OFFERS ---
        await db.execute('DELETE FROM offers WHERE valid_until < NOW()');

        const shopId = req.user.id;
        const [rows] = await db.execute(
            'SELECT id AS offer_id, title, description, discount_details, valid_until, image_url FROM offers WHERE shop_id = ? ORDER BY created_at DESC',
            [shopId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching shop offers' });
    }
};

// --- EDIT/UPDATE AN OFFER ---
const updateOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const shopId = req.user.id;
        const { title, description, discount_details, valid_until } = req.body;

        // NEW: Check if a new image was uploaded!
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            const [result] = await db.execute(
                'UPDATE offers SET title = ?, description = ?, discount_details = ?, valid_until = ?, image_url = ? WHERE id = ? AND shop_id = ?',
                [title, description, discount_details, valid_until, imageUrl, offerId, shopId]
            );
            if (result.affectedRows === 0) return res.status(403).json({ message: 'Unauthorized' });
        } else {
            // Update without changing the image
            const [result] = await db.execute(
                'UPDATE offers SET title = ?, description = ?, discount_details = ?, valid_until = ? WHERE id = ? AND shop_id = ?',
                [title, description, discount_details, valid_until, offerId, shopId]
            );
            if (result.affectedRows === 0) return res.status(403).json({ message: 'Unauthorized' });
        }

        res.status(200).json({ message: 'Offer updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating offer' });
    }
};

// --- NEW: GET FEATURED SHOPS FOR HOME PAGE ---
const getFeaturedShops = async (req, res) => {
    try {
        // Fetch up to 8 shops that have actually uploaded a logo
        const [rows] = await db.execute('SELECT id, shop_name AS name, logo_url FROM shop_owners WHERE logo_url IS NOT NULL LIMIT 8');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching featured shops' });
    }
};

// --- NEW: GET ALL SHOPS FOR DIRECTORY ---
const getShopDirectory = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, location FROM shop_owners ORDER BY name ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching shop directory' });
    }
};

// --- NEW: GET SPECIFIC SHOP & ITS OFFERS ---
const getShopPageData = async (req, res) => {
    try {
        const shopId = req.params.id;
        
        // 1. Get Shop Details
        const [shopRows] = await db.execute('SELECT id, name, location, logo_url FROM shop_owners WHERE id = ?', [shopId]);
        if (shopRows.length === 0) return res.status(404).json({ message: 'Shop not found' });

        // 2. Get Active Offers for this Shop
        const [offerRows] = await db.execute(`
            SELECT offers.id AS offer_id, offers.title, offers.description, offers.discount_details, offers.valid_until, offers.image_url, shop_owners.name AS shop_name, shop_owners.location 
            FROM offers 
            JOIN shop_owners ON offers.shop_id = shop_owners.id 
            WHERE offers.shop_id = ? AND offers.valid_until >= NOW()
            ORDER BY offers.created_at DESC
        `, [shopId]);

        res.status(200).json({ shop: shopRows[0], offers: offerRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching shop page data' });
    }
};

// --- GET POPULAR STORES DIRECTORY ---
const getDirectoryShops = async (req, res) => {
    try {
        // Fetch the IDs and names of all registered shops
        const [shops] = await db.execute('SELECT id, shop_name AS name FROM shop_owners ORDER BY shop_name ASC');
        res.status(200).json(shops);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching directory' });
    }
};

module.exports = { createOffer, getAllOffers, deleteOffer, getShopOffers, updateOffer, getFeaturedShops, getShopDirectory, getShopPageData, getDirectoryShops };
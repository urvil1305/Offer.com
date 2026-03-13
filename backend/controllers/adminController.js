// backend/controllers/adminController.js
const db = require('../config/db');

// Fetch EVERYTHING for the Admin Dashboard
const getAdminDashboardData = async (req, res) => {
    // Security Check: Only ID 999 (The Admin) is allowed in!
    if (req.user.id !== 999) return res.status(403).json({ message: 'Access Denied: Admins Only' });

    try {
        const [users] = await db.execute('SELECT id, name, email, location, created_at, status FROM users ORDER BY created_at DESC');
        const [shops] = await db.execute('SELECT id, shop_name, email, location, created_at, status FROM shop_owners ORDER BY created_at DESC');
        const [offers] = await db.execute(`
            SELECT offers.id, offers.title, offers.discount_details, shop_owners.shop_name, offers.created_at 
            FROM offers 
            JOIN shop_owners ON offers.shop_id = shop_owners.id 
            ORDER BY offers.created_at DESC
        `);

        res.status(200).json({ users, shops, offers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching admin data' });
    }
};

// The Ultimate Delete Function
const deleteItem = async (req, res) => {
    if (req.user.id !== 999) return res.status(403).json({ message: 'Access Denied: Admins Only' });
    
    const { type, id } = req.params; // type will be 'user', 'shop', or 'offer'

    try {
        if (type === 'user') {
            await db.execute('DELETE FROM claims WHERE user_id = ?', [id]); // Cascade delete claims
            await db.execute('DELETE FROM users WHERE id = ?', [id]);
        } 
        else if (type === 'shop') {
            await db.execute('DELETE FROM offers WHERE shop_id = ?', [id]); // Cascade delete their offers
            await db.execute('DELETE FROM shop_owners WHERE id = ?', [id]);
        } 
        else if (type === 'offer') {
            await db.execute('DELETE FROM claims WHERE offer_id = ?', [id]); // Cascade delete claims on this offer
            await db.execute('DELETE FROM offers WHERE id = ?', [id]);
        } 
        else {
            return res.status(400).json({ message: 'Invalid deletion type' });
        }

        res.status(200).json({ message: `${type} deleted successfully!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error deleting ${type}.` });
    }
};

// --- APPROVE OR REJECT ACCOUNTS ---
const updateAccountStatus = async (req, res) => {
    if (req.user.id !== 999) return res.status(403).json({ message: 'Access Denied: Admins Only' });
    
    const { type, id } = req.params; // 'user' or 'shop'
    const { status } = req.body;     // 'approved' or 'rejected'

    try {
        const table = type === 'user' ? 'users' : 'shop_owners';
        await db.execute(`UPDATE ${table} SET status = ? WHERE id = ?`, [status, id]);
        res.status(200).json({ message: `${type} has been ${status}!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating status' });
    }
};

module.exports = { getAdminDashboardData, deleteItem, updateAccountStatus };
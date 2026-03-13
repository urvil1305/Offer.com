// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getAdminDashboardData, deleteItem, updateAccountStatus } = require('../controllers/adminController');

// Route to change status
router.put('/:type/:id/status', verifyToken, updateAccountStatus);

// Route to get all data
router.get('/dashboard', verifyToken, getAdminDashboardData);

// Route to delete anything (dynamic parameter for type: user/shop/offer)
router.delete('/:type/:id', verifyToken, deleteItem);

module.exports = router;
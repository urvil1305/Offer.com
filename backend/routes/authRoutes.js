// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import all 4 functions in ONE single block so there are no duplicates
const { 
    registerUser, 
    loginUser, 
    registerShopOwner, 
    loginShopOwner,
    getProfile,
    updateProfile,
    loginAdmin,
    updatePassword,
    registerShop
} = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

const uploadDirectory = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDirectory),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

// --- User Routes ---
router.post('/register/user', registerUser);    
router.post('/login/user', loginUser);

// --- The secure profile route! ---
router.get('/me', verifyToken, getProfile);


// --- Shop Owner Routes ---
router.post('/register/shop', upload.single('logo'), registerShopOwner);
router.post('/login/shop', loginShopOwner);

// This will be used for both users and shop owners to update their profile info
router.put('/me', verifyToken, updateProfile); 

// --- Admin Route ---
router.post('/login/admin', loginAdmin);

// Update your routes to intercept the 'logo' file!
router.post('/register/shop', upload.single('logo'), registerShop); 
router.put('/profile', verifyToken, upload.single('logo'), updateProfile);

// --- NEW PROFILE ROUTES ---
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/password', verifyToken, updatePassword);

module.exports = router;
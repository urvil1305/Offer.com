const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 

const { createOffer, getAllOffers, deleteOffer, getShopOffers, updateOffer, getFeaturedShops, getShopDirectory, getShopPageData } = require('../controllers/offerController');
const verifyToken = require('../middleware/authMiddleware');

// --- 1. MULTER SETUP (MUST BE FIRST!) ---
const uploadDirectory = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({ storage: storage });


// --- 2. ROUTES (MUST BE LAST!) ---
router.post('/create', verifyToken, upload.single('image'), createOffer);
router.get('/all', getAllOffers);
router.get('/my-offers', verifyToken, getShopOffers); 
router.get('/all', getAllOffers);
router.get('/featured-shops', getFeaturedShops); // <-- ADD THIS LINE!
router.get('/directory', getShopDirectory);
router.get('/shop/:id', getShopPageData);

// THE DELETE ROUTE CAN STAY ABOVE MULTER SINCE IT DOESN'T HANDLE FILE UPLOADS
router.delete('/:id', verifyToken, deleteOffer);

// THE FIXED EDIT ROUTE IS NOW SAFELY BELOW MULTER!
router.put('/:id', verifyToken, upload.single('image'), updateOffer);

module.exports = router;
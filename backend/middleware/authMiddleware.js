// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    
    // Tokens are usually sent as "Bearer eyJhbGci..." so we split by space to get just the token
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // 2. Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the decoded user/shop_owner data to the request object
        req.user = decoded; 
        
        // 4. Pass control to the next function (the controller)
        next(); 
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = verifyToken;
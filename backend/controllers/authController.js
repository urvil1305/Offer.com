// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- USER SIGNUP ---
const registerUser = async (req, res) => {
    try {
        const { name, email, password, location } = req.body;

        // 1. Check if the user already exists
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // 2. Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Insert the new user into the database
        await db.execute(
            'INSERT INTO users (name, email, password_hash, location) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, location || null]
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// --- USER LOGIN ---
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        // 2. Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

    
        // --- CHECK APPROVAL STATUS ---
        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Your account is waiting for Admin approval.' });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ message: 'Your account registration was rejected.' });
        }

        // 3. Generate a JWT Token
        const token = jwt.sign(
            { id: user.id, role: 'user' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token expires in 1 day
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            user: { id: user.id, name: user.name, email: user.email } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// --- SHOP OWNER SIGNUP ---
const registerShopOwner = async (req, res) => {
    try {
        // FIXED: We extract shop_name, not name!
        const { shop_name, email, password, location } = req.body;
        
        // 1. Check if email is already used
        const [existingShop] = await db.execute('SELECT * FROM shop_owners WHERE email = ?', [email]);
        if (existingShop.length > 0) return res.status(400).json({ message: 'Email already registered' });

        // 2. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Grab the uploaded logo path (if they uploaded one)
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // 4. Save everything to the database!
        // 4. Save everything to the database!
        await db.execute(
            // FIXED: We are passing data to BOTH 'name' and 'shop_name' to satisfy MySQL!
            'INSERT INTO shop_owners (name, shop_name, email, password_hash, location, logo_url) VALUES (?, ?, ?, ?, ?, ?)',
            [shop_name, shop_name, email, hashedPassword, location, logoUrl]
        );

        res.status(201).json({ message: 'Business account created successfully! Please wait for admin approval.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during shop registration' });
    }
};

// --- SHOP OWNER LOGIN ---
const loginShopOwner = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the shop owner by email
        const [owners] = await db.execute('SELECT * FROM shop_owners WHERE email = ?', [email]);
        if (owners.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const owner = owners[0];

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, owner.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // --- CHECK APPROVAL STATUS ---
        if (owner.status === 'pending') {
            return res.status(403).json({ message: 'Your account is waiting for Admin approval.' });
        }
        if (owner.status === 'rejected') {
            return res.status(403).json({ message: 'Your account registration was rejected.' });
        }

        // 3. Generate a JWT Token (Notice the role is 'shop_owner' this time)
        const token = jwt.sign(
            { id: owner.id, role: 'shop_owner' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            owner: { 
                id: owner.id, 
                name: owner.name, 
                shop_name: owner.shop_name, 
                email: owner.email,
                status: owner.status // The frontend will need this to know if they can post offers yet!
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// --- GET PROFILE DATA (Now includes logo_url!) ---
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.query.role; 
        
        // We need different queries because users don't have logos, only shops do!
        let query;
        if (role === 'shop_owner') {
            query = 'SELECT shop_name AS name, email, location, created_at AS joined, logo_url FROM shop_owners WHERE id = ?';
        } else {
            query = 'SELECT name, email, location, created_at AS joined FROM users WHERE id = ?';
        }

        const [rows] = await db.execute(query, [userId]);
        
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = rows[0];
        const date = new Date(user.joined);
        user.joined = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};

// --- UPDATE PROFILE DETAILS (Now handles image uploads!) ---
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, location, role } = req.body;

        if (role === 'shop_owner') {
            // Check if they uploaded a new logo!
            if (req.file) {
                const logoUrl = `/uploads/${req.file.filename}`;
                await db.execute(
                    'UPDATE shop_owners SET shop_name = ?, location = ?, logo_url = ? WHERE id = ?', 
                    [name, location, logoUrl, userId]
                );
            } else {
                // Update without changing the logo
                await db.execute(
                    'UPDATE shop_owners SET shop_name = ?, location = ? WHERE id = ?', 
                    [name, location, userId]
                );
            }
        } else {
            // Regular users don't have logos
            await db.execute('UPDATE users SET name = ?, location = ? WHERE id = ?', [name, location, userId]);
        }
        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

// --- NEW: UPDATE PASSWORD SECURELY ---
const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, role } = req.body;
        const table = role === 'shop_owner' ? 'shop_owners' : 'users';

        // 1. Get the user's current hashed password from the DB
        const [rows] = await db.execute(`SELECT password FROM ${table} WHERE id = ?`, [userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        // 2. Compare the current password
        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password!' });

        // 3. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Save the new password
        await db.execute(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedPassword, userId]);

        res.status(200).json({ message: 'Password updated securely!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while changing password' });
    }
};

// --- MASTER ADMIN LOGIN ---
const loginAdmin = async (req, res) => {
    const jwt = require('jsonwebtoken'); // Just in case it isn't imported at the top!
    const { email, password } = req.body;

    // Hardcoded Super Admin for the MCA Project
    if (email === 'admin@offer.com' && password === 'admin123') {
        // We give the admin a special ID of 999 so the backend knows who they are
        const token = jwt.sign({ id: 999, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ token: token, message: 'Welcome, Super Admin!' });
    }

    return res.status(401).json({ message: 'Invalid Admin Credentials' });
};

// --- NEW: REGISTER SHOP WITH LOGO ---
const registerShop = async (req, res) => {
    try {
        const { shop_name, email, password, location } = req.body;
        
        // 1. Check if email is already used
        const [existingShop] = await db.execute('SELECT * FROM shop_owners WHERE email = ?', [email]);
        if (existingShop.length > 0) return res.status(400).json({ message: 'Email already registered' });

        // 2. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Grab the uploaded logo path (if they uploaded one)
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // 4. Save everything to the database!
        await db.execute(
            'INSERT INTO shop_owners (shop_name, email, password, location, logo_url) VALUES (?, ?, ?, ?, ?)',
            [shop_name, email, hashedPassword, location, logoUrl]
        );

        res.status(201).json({ message: 'Business account created successfully! Please wait for admin approval.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during shop registration' });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    registerShopOwner, 
    loginShopOwner,
    getProfile,
    updateProfile,
    updatePassword,
    loginAdmin,
    registerShop
};

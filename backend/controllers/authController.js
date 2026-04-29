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

        // 3. Insert the new user into the database (Automatically Approved!)
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
        // FIXED: We now extract category_id from the form data!
        const { shop_name, email, password, location, category_id } = req.body;
        
        // 1. Check if email is already used
        const [existingShop] = await db.execute('SELECT * FROM shop_owners WHERE email = ?', [email]);
        if (existingShop.length > 0) return res.status(400).json({ message: 'Email already registered' });

        // 2. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Grab the uploaded logo path (if they uploaded one)
        const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // 4. Save everything to the database, including the new category_id!
        // Note: We pass shop_name twice to satisfy the 'name' and 'shop_name' columns.
        await db.execute(
            'INSERT INTO shop_owners (name, shop_name, category_id, email, password_hash, location, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [shop_name, shop_name, category_id, email, hashedPassword, location, logoUrl]
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
            query = `
                        SELECT shop_owners.shop_name AS name, shop_owners.email, shop_owners.location, shop_owners.created_at AS joined, shop_owners.logo_url, categories.name AS category_name 
                        FROM shop_owners 
                        LEFT JOIN categories ON shop_owners.category_id = categories.id
                        WHERE shop_owners.id = ?
                    `;        
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

// --- UPDATE PROFILE DETAILS (Now handles image uploads & categories!) ---
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        // NEW: We extract category_id from the request body!
        const { name, location, role, category_id } = req.body;

        if (role === 'shop_owner') {
            // Check if they uploaded a new logo!
            if (req.file) {
                const logoUrl = `/uploads/${req.file.filename}`;
                await db.execute(
                    // Added category_id to the query
                    'UPDATE shop_owners SET shop_name = ?, location = ?, category_id = ?, logo_url = ? WHERE id = ?', 
                    [name, location, category_id, logoUrl, userId]
                );
            } else {
                // Update without changing the logo
                await db.execute(
                    // Added category_id to the query
                    'UPDATE shop_owners SET shop_name = ?, location = ?, category_id = ? WHERE id = ?', 
                    [name, location, category_id, userId]
                );
            }
        } else {
            // Regular users don't have logos or categories
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

        // 1. FIXED: Select 'password_hash' instead of 'password'
        const [rows] = await db.execute(`SELECT password_hash FROM ${table} WHERE id = ?`, [userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        // 2. FIXED: Compare against 'password_hash'
        const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password!' });

        // 3. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. FIXED: Update the 'password_hash' column
        await db.execute(`UPDATE ${table} SET password_hash = ? WHERE id = ?`, [hashedPassword, userId]);

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

// --- UNIFIED SMART LOGIN ---
const unifiedLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const jwt = require('jsonwebtoken'); // Ensure jwt is available

        // 1. Check if it's the Super Admin
        if (email === 'admin@offer.com' && password === 'admin123') {
            const token = jwt.sign({ id: 999, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.status(200).json({ message: 'Welcome, Super Admin!', token, role: 'admin', user: { id: 999, name: 'Super Admin', email } });
        }

        // 2. Check the Users Table
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.status(200).json({ 
                    message: 'Login successful', 
                    token, 
                    role: 'user', // <--- Telling React this is a normal user
                    user: { id: user.id, name: user.name, email: user.email } 
                });
            }
        }

        // 3. Check the Shop Owners Table
        const [owners] = await db.execute('SELECT * FROM shop_owners WHERE email = ?', [email]);
        if (owners.length > 0) {
            const owner = owners[0];
            const isMatch = await bcrypt.compare(password, owner.password_hash);
            if (isMatch) {
                if (owner.status === 'pending') return res.status(403).json({ message: 'Your account is waiting for Admin approval.' });
                if (owner.status === 'rejected') return res.status(403).json({ message: 'Your account registration was rejected.' });

                const token = jwt.sign({ id: owner.id, role: 'shop_owner' }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.status(200).json({ 
                    message: 'Login successful', 
                    token, 
                    role: 'shop_owner', // <--- Telling React this is a business
                    user: { id: owner.id, name: owner.name, shop_name: owner.shop_name, email: owner.email } 
                });
            }
        }

        // 4. If we reach here, the email/password didn't match ANY of the 3 databases!
        return res.status(400).json({ message: 'Invalid email or password' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
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
    registerShop,
    unifiedLogin
};

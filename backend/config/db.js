// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// 1. Let's verify what Node.js is actually reading from your .env file
console.log('--- Database Debug Info ---');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('---------------------------');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('Attempting to connect to MySQL...');

pool.getConnection()
    .then((connection) => {
        console.log('✅ Database connected successfully to Offer_db!');
        connection.release(); 
    })
    .catch((err) => {
        console.error('❌ Error connecting to the database:', err.message);
        console.error('Error Code:', err.code);
    });

module.exports = pool;
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'debruyne17', // Your MySQL password
  database: 'nwusoccer'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.log('\n=== DATABASE SETUP REQUIRED ===');
    console.log('Please ensure MySQL is installed and running.');
    console.log('Options:');
    console.log('1. Install MySQL Community Server');
    console.log('2. Install XAMPP and start MySQL service');
    console.log('3. Update password in app/backend/server.js if MySQL is already installed');
    console.log('================================\n');
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create database if it doesn't exist
  db.query('CREATE DATABASE IF NOT EXISTS nwusoccer', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log('Database nwusoccer ready');
    
    // Use the database
    db.query('USE nwusoccer', (err) => {
      if (err) {
        console.error('Error using database:', err);
        return;
      }
      
      // Create tables
      createTables();
    });
  });
});

// Create tables
function createTables() {
  // Create login_table
  const createLoginTable = `
    CREATE TABLE IF NOT EXISTS login_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'coach', 'player', 'scouter') DEFAULT 'player',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  // Create register_table
  const createRegisterTable = `
    CREATE TABLE IF NOT EXISTS register_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      role ENUM('admin', 'coach', 'player', 'scouter') DEFAULT 'player',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createLoginTable, (err) => {
    if (err) {
      console.error('Error creating login_table:', err);
    } else {
      console.log('login_table created successfully');
    }
  });
  
  db.query(createRegisterTable, (err) => {
    if (err) {
      console.error('Error creating register_table:', err);
    } else {
      console.log('register_table created successfully');
    }
  });
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM login_table WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert into register_table
      const insertRegisterQuery = `
        INSERT INTO register_table (first_name, last_name, email, phone, role) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(insertRegisterQuery, [firstName, lastName, email, phone, role || 'player'], (err, registerResult) => {
        if (err) {
          console.error('Error inserting into register_table:', err);
          return res.status(500).json({ error: 'Error creating user registration' });
        }
        
        // Insert into login_table
        const insertLoginQuery = `
          INSERT INTO login_table (email, password, role) 
          VALUES (?, ?, ?)
        `;
        
        db.query(insertLoginQuery, [email, hashedPassword, role || 'player'], (err, loginResult) => {
          if (err) {
            console.error('Error inserting into login_table:', err);
            return res.status(500).json({ error: 'Error creating user login credentials' });
          }
          
          res.status(201).json({ 
            message: 'User registered successfully',
            userId: loginResult.insertId
          });
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user in login_table
    const loginQuery = 'SELECT * FROM login_table WHERE email = ?';
    db.query(loginQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const user = results[0];
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Get user details from register_table
      const userDetailsQuery = 'SELECT * FROM register_table WHERE email = ?';
      db.query(userDetailsQuery, [email], (err, userDetails) => {
        if (err) {
          console.error('Error fetching user details:', err);
          return res.status(500).json({ error: 'Error fetching user details' });
        }
        
        const userInfo = userDetails[0] || {};
        
        // Create JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
          },
          'your-secret-key', // In production, use environment variable
          { expiresIn: '24h' }
        );
        
        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
            email: user.email,
            role: user.role,
            phone: userInfo.phone
          }
        });
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

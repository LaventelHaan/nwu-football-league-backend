const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'debruyne17', // SQL password
  database: 'nwusoccer'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
  
  // Create database if it doesn't exist
  db.query('CREATE DATABASE IF NOT EXISTS nwusoccer', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log('✅ Database nwusoccer ready');
    
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
      console.log('✅ login_table created successfully');
    }
  });
  
  db.query(createRegisterTable, (err) => {
    if (err) {
      console.error('Error creating register_table:', err);
    } else {
      console.log('✅ register_table created successfully');
    }
  });
}

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend server is running!', 
    status: 'success',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Register endpoint (without password hashing for now)
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
      
      // For now, store password as plain text (we'll add hashing later)
      const plainPassword = password;
      
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
        
        db.query(insertLoginQuery, [email, plainPassword, role || 'player'], (err, loginResult) => {
          if (err) {
            console.error('Error inserting into login_table:', err);
            return res.status(500).json({ error: 'Error creating user login credentials' });
          }
          
          res.status(201).json({ 
            message: 'User registered successfully',
            userId: loginResult.insertId,
            note: 'Password stored as plain text (hashing will be added later)'
          });
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint (without password hashing for now)
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
      
      // For now, compare passwords directly (we'll add hashing later)
      if (password !== user.password) {
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
        
        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
            email: user.email,
            role: user.role,
            phone: userInfo.phone
          },
          note: 'Password comparison done without hashing (temporary)'
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
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database: nwusoccer`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = app;

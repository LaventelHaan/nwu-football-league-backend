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
  
  // Create players table
  const createPlayersTable = `
    CREATE TABLE IF NOT EXISTS players (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      team VARCHAR(255) NOT NULL,
      position ENUM('Forward', 'Midfielder', 'Defender', 'Goalkeeper') NOT NULL,
      age INT NOT NULL,
      nationality VARCHAR(100),
      goals INT DEFAULT 0,
      assists INT DEFAULT 0,
      appearances INT DEFAULT 0,
      games_played INT DEFAULT 0,
      yellow_cards INT DEFAULT 0,
      red_cards INT DEFAULT 0,
      avatar VARCHAR(500),
      join_date DATE,
      previous_team VARCHAR(255),
      jersey_number INT,
      height INT, -- in cm
      weight INT, -- in kg
      performance INT DEFAULT 0, -- performance rating (0-100)
      medical_notes TEXT,
      email VARCHAR(255),
      phone VARCHAR(20),
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(20),
      status VARCHAR(50) DEFAULT 'Active',
      rating DECIMAL(3,1) DEFAULT 0.0,
      matches_played INT DEFAULT 0,
      medical_status VARCHAR(50) DEFAULT 'Fit',
      clean_sheets INT DEFAULT 0, -- Only for goalkeepers
      saves INT DEFAULT 0, -- Only for goalkeepers
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  // Create teams table
  const createTeamsTable = `
    CREATE TABLE IF NOT EXISTS teams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      played INT DEFAULT 0,
      wins INT DEFAULT 0,
      draws INT DEFAULT 0,
      losses INT DEFAULT 0,
      goals_for INT DEFAULT 0,
      goals_against INT DEFAULT 0,
      goal_difference INT DEFAULT 0,
      points INT DEFAULT 0,
      form VARCHAR(15), -- e.g., 'W,W,W,D,W'
      trend ENUM('up', 'down', 'same') DEFAULT 'same',
      position INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  // Create fixtures table
  const createFixturesTable = `
    CREATE TABLE IF NOT EXISTS fixtures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      home_team VARCHAR(255) NOT NULL,
      away_team VARCHAR(255) NOT NULL,
      league VARCHAR(100) DEFAULT 'Premier League',
      date DATE NOT NULL,
      time TIME NOT NULL,
      venue VARCHAR(255),
      status ENUM('upcoming', 'live', 'final', 'PENDING', 'COMPLETED', 'APPROVED', 'REJECTED') DEFAULT 'upcoming',
      round VARCHAR(50),
      home_score INT,
      away_score INT,
      attendance INT,
      highlights JSON,
      created_by VARCHAR(255),
      submitted_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  // Create team_registrations table
  const createTeamRegistrationsTable = `
    CREATE TABLE IF NOT EXISTS team_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type ENUM('team', 'league') DEFAULT 'team',
      league VARCHAR(100),
      coach VARCHAR(255),
      organizer VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(20),
      players INT,
      max_players INT,
      teams INT,
      max_teams INT,
      founded_year INT,
      home_venue VARCHAR(255),
      season VARCHAR(50),
      start_date DATE,
      end_date DATE,
      status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
      submitted_date DATE,
      description TEXT,
      documents JSON,
      player_list JSON,
      coach_certification VARCHAR(255),
      application_fee VARCHAR(50),
      payment_status VARCHAR(50),
      registration_fee VARCHAR(50),
      prize_pool VARCHAR(50),
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  // Execute table creation queries
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
  
  db.query(createPlayersTable, (err) => {
    if (err) {
      console.error('Error creating players table:', err);
    } else {
      console.log('players table created successfully');
    }
  });
  
  db.query(createTeamsTable, (err) => {
    if (err) {
      console.error('Error creating teams table:', err);
    } else {
      console.log('teams table created successfully');
    }
  });
  
  db.query(createFixturesTable, (err) => {
    if (err) {
      console.error('Error creating fixtures table:', err);
    } else {
      console.log('fixtures table created successfully');
    }
  });
  
  db.query(createTeamRegistrationsTable, (err) => {
    if (err) {
      console.error('Error creating team_registrations table:', err);
    } else {
      console.log('team_registrations table created successfully');
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

// Players endpoints
app.get('/api/players', (req, res) => {
  const query = 'SELECT * FROM players ORDER BY name';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching players:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/players/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM players WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching player:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(results[0]);
  });
});

// Teams endpoints
app.get('/api/teams', (req, res) => {
  const query = 'SELECT * FROM teams ORDER BY position';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching teams:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/standings', (req, res) => {
  const query = 'SELECT * FROM teams ORDER BY position';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching standings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Fixtures endpoints
app.get('/api/fixtures', (req, res) => {
  const query = 'SELECT * FROM fixtures ORDER BY date, time';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching fixtures:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/results', (req, res) => {
  const query = 'SELECT * FROM fixtures WHERE status = "final" ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching results:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Team registrations endpoint
app.get('/api/team-registrations', (req, res) => {
  const query = 'SELECT * FROM team_registrations ORDER BY submitted_date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching team registrations:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

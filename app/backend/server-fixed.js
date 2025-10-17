const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PORT = process.env.PORT || 3002;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'debruyne17',
  database: 'nwusoccer'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
  
  // Create tables if they don't exist
  createTables();
});

// Create tables
function createTables() {
  // Drop existing tables to ensure clean schema
  const dropQueries = [
    'DROP TABLE IF EXISTS users',
    'DROP TABLE IF EXISTS login_table',
    'DROP TABLE IF EXISTS register_table',
    'DROP TABLE IF EXISTS field_bookings',  // Add this to force recreation
    'DROP TABLE IF EXISTS medical_records',  // Add this to force recreation
    'DROP TABLE IF EXISTS venues'  // Add this to force recreation
  ];
  
  let completed = 0;
  dropQueries.forEach(query => {
    db.query(query, (err) => {
      if (err) {
        console.error('Error dropping table:', err);
      } else {
        console.log('✅ Table dropped successfully');
      }
      completed++;
      if (completed === dropQueries.length) {
        createUsersTable();
      }
    });
  });
}

function createUsersTable() {
  // Create users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      date_of_birth DATE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'coach', 'player', 'scout') NOT NULL DEFAULT 'player',
      team VARCHAR(255),
      position VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT NULL
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
      height INT,
      weight INT,
      performance INT DEFAULT 0,
      medical_notes TEXT,
      email VARCHAR(255),
      phone VARCHAR(20),
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(20),
      status VARCHAR(50) DEFAULT 'Active',
      rating DECIMAL(3,1) DEFAULT 0.0,
      matches_played INT DEFAULT 0,
      medical_status VARCHAR(50) DEFAULT 'Fit',
      clean_sheets INT DEFAULT 0,
      saves INT DEFAULT 0,
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
      form VARCHAR(15),
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
      referee VARCHAR(255),
      notes TEXT,
      status ENUM('upcoming', 'live', 'final', 'PENDING', 'COMPLETED', 'APPROVED', 'REJECTED') DEFAULT 'upcoming',
      round VARCHAR(50),
      home_score INT,
      away_score INT,
      attendance INT,
      highlights TEXT,
      created_by VARCHAR(255),
      submitted_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Create field_bookings table
  const createFieldBookingsTable = `
    CREATE TABLE IF NOT EXISTS field_bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      coach_id INT,
      date DATE NOT NULL,
      time TIME NOT NULL,
      duration DECIMAL(3,1) NOT NULL,
      field VARCHAR(255) NOT NULL,
      purpose VARCHAR(255) NOT NULL,
      notes TEXT,
      status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  // Create leagues table
  const createLeaguesTable = `
    CREATE TABLE IF NOT EXISTS leagues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
      total_teams INT DEFAULT 0,
      total_matches INT DEFAULT 0,
      current_season VARCHAR(50) DEFAULT '2024-2025',
      champion VARCHAR(255),
      founded_year VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  // Execute table creation queries
  db.query(createUsersTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('✅ users table created successfully');
      
      // Ensure role enum is correct
      const alterRoleQuery = `ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'coach', 'player', 'scout') DEFAULT 'player'`;
      db.query(alterRoleQuery, (alterErr) => {
        if (alterErr) {
          console.error('Error updating role enum:', alterErr);
        } else {
          console.log('✅ Role enum updated to include scout');
        }
      });
    }
  });
  
  db.query(createPlayersTable, (err) => {
    if (err) {
      console.error('Error creating players table:', err);
    } else {
      console.log('✅ players table created successfully');
    }
  });
  
  db.query(createTeamsTable, (err) => {
    if (err) {
      console.error('Error creating teams table:', err);
    } else {
      console.log('✅ teams table created successfully');
    }
  });
  
  db.query(createFixturesTable, (err) => {
    if (err) {
      console.error('Error creating fixtures table:', err);
    } else {
      console.log('✅ fixtures table created successfully');
      
      // Check if fixtures table is empty and seed with mock data if so
      db.query('SELECT COUNT(*) as count FROM fixtures', (countErr, countResult) => {
        if (countErr) {
          console.error('Error checking fixtures count:', countErr);
        } else if (countResult[0].count === 0) {
          // Only seed if table is empty
          const seedFixtures = `
            INSERT INTO fixtures (home_team, away_team, league, date, time, venue, status, round, created_by, submitted_date) VALUES
            ('NWU Eagles', 'Wits Wolves', 'Premier League', '2024-01-15', '15:00', 'NWU Stadium', 'PENDING', 'Round 19', 'Admin', '2025-09-18'),
            ('UCT Lions', 'UP Tuks', 'Premier League', '2024-01-15', '17:30', 'UCT Grounds', 'upcoming', 'Round 19', 'John', '2025-09-18'),
            ('UJ Orange', 'Stellenbosch FC', 'Premier League', '2024-01-16', '14:00', 'UJ Stadium', 'PENDING', 'Round 19', 'Mary', '2025-09-17'),
            ('Rhodes United', 'UKZN Sharks', 'Premier League', '2024-01-16', '16:30', 'Rhodes Park', 'upcoming', 'Round 19', 'Alex', '2025-09-16')
          `;
          
          db.query(seedFixtures, (seedErr) => {
            if (seedErr) {
              console.error('Error seeding fixtures:', seedErr);
            } else {
              console.log('✅ fixtures table seeded with mock data');
            }
          });
        } else {
          console.log('✅ fixtures table already contains data, skipping seed');
        }
      });
    }
  });
  
  db.query(createFieldBookingsTable, (err) => {
    if (err) {
      console.error('Error creating field_bookings table:', err);
    } else {
      console.log('✅ field_bookings table created successfully');
    }
  });

  db.query(createLeaguesTable, (err) => {
    if (err) {
      console.error('Error creating leagues table:', err);
    } else {
      console.log('✅ leagues table created successfully');
      
      // Seed leagues table with mock data if empty
      db.query('SELECT COUNT(*) as count FROM leagues', (countErr, countResult) => {
        if (countErr) {
          console.error('Error checking leagues count:', countErr);
        } else if (countResult[0].count === 0) {
          // Only seed if table is empty
          const seedLeagues = `
            INSERT INTO leagues (name, description, status, total_teams, total_matches, current_season, champion, founded_year) VALUES
            ('Premier League', 'Top tier professional football league', 'active', 16, 240, '2024-2025', 'NWU Eagles', '2018'),
            ('Championship Division', 'Second tier competitive league', 'active', 12, 132, '2024-2025', 'UP Tuks', '2019'),
            ('Women\'s Premier League', 'Elite women\'s football competition', 'active', 8, 56, '2024-2025', 'UJ Orange', '2020')
          `;
          
          db.query(seedLeagues, (seedErr) => {
            if (seedErr) {
              console.error('Error seeding leagues:', seedErr);
            } else {
              console.log('✅ leagues table seeded with mock data');
            }
          });
        } else {
          console.log('✅ leagues table already contains data, skipping seed');
        }
      });
    }
  });

  // Create medical_records table
  const createMedicalRecordsTable = `
    CREATE TABLE IF NOT EXISTS medical_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      player_id INT,
      date DATE NOT NULL,
      type ENUM('checkup', 'injury', 'treatment', 'clearance') NOT NULL,
      description TEXT NOT NULL,
      doctor VARCHAR(255) NOT NULL,
      status ENUM('active', 'resolved', 'ongoing') DEFAULT 'active',
      follow_up_date DATE,
      restrictions TEXT,
      medications TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Create venues table
  const createVenuesTable = `
    CREATE TABLE IF NOT EXISTS venues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      capacity INT NOT NULL,
      type ENUM('Stadium', 'Multi-purpose', 'Training Ground', 'Indoor Arena') NOT NULL,
      surface ENUM('Natural Grass', 'Artificial Turf', 'Hybrid Grass', 'Indoor Court') NOT NULL,
      status ENUM('Active', 'Maintenance', 'Inactive') DEFAULT 'Active',
      facilities JSON,
      manager VARCHAR(255),
      manager_phone VARCHAR(20),
      manager_email VARCHAR(255),
      fields JSON,
      bookings INT DEFAULT 0,
      last_maintenance DATE,
      next_maintenance DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  db.query(createMedicalRecordsTable, (err) => {
    if (err) {
      console.error('Error creating medical_records table:', err);
    } else {
      console.log('✅ medical_records table created successfully');
    }
  });

  db.query(createVenuesTable, (err) => {
    if (err) {
      console.error('Error creating venues table:', err);
    } else {
      console.log('✅ venues table created successfully');
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

// Logout endpoint
app.post('/api/logout', (req, res) => {
  console.log('🚪 Logout request received');
  
  // In a real application, you would invalidate the JWT token here
  // For now, we'll just return a success message
  res.json({
    message: 'Logout successful',
    status: 'success'
  });
});

// Register endpoint with better error handling
app.post('/api/register', (req, res) => {
  console.log('📝 Registration request received:', req.body);
  
  try {
    const { firstName, lastName, email, phone, password, role, team, position, dateOfBirth } = req.body;
    
    // Convert role to lowercase to match database enum
    let normalizedRole = role ? role.toLowerCase() : 'player';
    
    // Handle legacy 'scouter' value
    if (normalizedRole === 'scouter') normalizedRole = 'scout';
    if (!firstName || !lastName || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'All required fields must be provided',
        received: { firstName, lastName, email, phone, password, role: normalizedRole }
      });
    }
    
    console.log('✅ All required fields present');
    
    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
    console.log('🔍 Checking if user exists with email:', email);
    
    db.query(checkUserQuery, [email], (err, results) => {
      if (err) {
        console.error('❌ Database error checking user:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      
      console.log('🔍 User check results:', results);
      
      if (results.length > 0) {
        console.log('❌ User already exists');
        return res.status(400).json({ error: 'User already exists with this email' });
      }
      
      console.log('✅ User does not exist, proceeding with registration');
      
      // Insert into users table
      const insertUserQuery = `
        INSERT INTO users (first_name, last_name, email, phone, date_of_birth, password, role, team, position) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const userValues = [firstName, lastName, email, phone || null, dateOfBirth || null, password, normalizedRole, team || 'N/A', position || 'N/A'];
      console.log('📝 Inserting into users table with values:', userValues);
      
      db.query(insertUserQuery, userValues, (err, result) => {
        if (err) {
          console.error('❌ Error inserting into users table:', err);
          return res.status(500).json({ 
            error: 'Error creating user: ' + err.message,
            details: err
          });
        }
        
        console.log('✅ Successfully inserted into users table, ID:', result.insertId);
        
        // If role is player, also insert into players table
        if (normalizedRole === 'player') {
          // Calculate age from date of birth
          let age = null;
          if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          
          const playerName = `${firstName} ${lastName}`;
          const insertPlayerQuery = `
            INSERT INTO players (name, team, position, age, email, phone, join_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          const playerValues = [
            playerName,
            team || 'N/A', // team from form or default
            position || 'N/A', // position from form or default
            age,
            email,
            phone || null,
            new Date().toISOString().split('T')[0] // join_date
          ];
          
          db.query(insertPlayerQuery, playerValues, (playerErr, playerResult) => {
            if (playerErr) {
              console.error('❌ Error inserting into players table:', playerErr);
              // Don't fail the whole registration, just log the error
            } else {
              console.log('✅ Successfully inserted into players table, ID:', playerResult.insertId);
            }
          });
        }
        
        console.log('🎉 User registration completed successfully!');
        
        res.status(201).json({ 
          message: 'User registered successfully',
          userId: result.insertId,
          user: {
            firstName,
            lastName,
            email,
            role: normalizedRole
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

// Login endpoint with better error handling
app.post('/api/login', (req, res) => {
  console.log('🔐 Login request received:', { email: req.body.email, password: '***' });
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user in users table
    const loginQuery = 'SELECT * FROM users WHERE email = ?';
    console.log('🔍 Looking for user with email:', email);
    
    db.query(loginQuery, [email], (err, results) => {
      if (err) {
        console.error('❌ Database error during login:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      
      console.log('🔍 Login query results:', results.length, 'users found');
      
      if (results.length === 0) {
        console.log('❌ No user found with email:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const user = results[0];
      console.log('👤 User found:', { id: user.id, email: user.email, role: user.role });
      
      // Compare passwords (plain text for now)
      if (password !== user.password) {
        console.log('❌ Password mismatch');
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      console.log('🎉 Login successful for user:', user.email);
      // Removed verbose success logging
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

// User Management Endpoints

// GET /api/users - Get all users
app.get('/api/users', (req, res) => {
  console.log('👥 Getting all users');

  const getUsersQuery = `
    SELECT
      id,
      email,
      role,
      created_at as joinDate,
      updated_at as lastLogin,
      first_name,
      last_name,
      phone,
      team,
      position,
      CASE
        WHEN role = 'admin' THEN 'Administrator'
        WHEN role = 'coach' THEN 'Coach'
        WHEN role = 'player' THEN 'Player'
        WHEN role = 'scout' THEN 'Scout'
        ELSE 'Unknown'
      END as role_display,
      'Active' as status,
      '/placeholder.svg' as avatar
    FROM users
    ORDER BY created_at DESC
  `;

  db.query(getUsersQuery, (err, results) => {
    if (err) {
      console.error('❌ Error fetching users:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    console.log(`✅ Found ${results.length} users`);
    res.json({
      message: 'Users retrieved successfully',
      users: results,
      count: results.length
    });
  });
});

// POST /api/users - Add new user
app.post('/api/users', (req, res) => {
  console.log('➕ Adding new user:', req.body);

  try {
    const { firstName, lastName, email, phone, password, role, team, position, dateOfBirth } = req.body;

    // Convert role to lowercase to match database enum
    let normalizedRole = role ? role.toLowerCase() : 'player';
    
    // Handle legacy 'scouter' value
    if (normalizedRole === 'scouter') normalizedRole = 'scout';
    if (!firstName || !lastName || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        error: 'All required fields must be provided',
        received: { firstName, lastName, email, phone, password, role: normalizedRole }
      });
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
    console.log('🔍 Checking if user exists with email:', email);

    db.query(checkUserQuery, [email], (err, results) => {
      if (err) {
        console.error('❌ Database error checking user:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }

      if (results.length > 0) {
        console.log('❌ User already exists');
        return res.status(400).json({ error: 'User already exists with this email' });
      }
      console.log('✅ User does not exist, proceeding with creation');

      // Insert into users table
      const insertUserQuery = `
        INSERT INTO users (first_name, last_name, email, phone, date_of_birth, password, role, team, position) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const userValues = [firstName, lastName, email, phone || null, dateOfBirth || null, password, normalizedRole, team || 'N/A', position || 'N/A'];
      console.log('📝 Inserting into users table with values:', userValues);

      db.query(insertUserQuery, userValues, (err, result) => {
        if (err) {
          console.error('❌ Error inserting into users table:', err);
          return res.status(500).json({
            error: 'Error creating user: ' + err.message,
            details: err
          });
        }

        console.log('✅ Successfully inserted into users table, ID:', result.insertId);
        console.log('🎉 User creation completed successfully!');

        res.status(201).json({
          message: 'User created successfully',
          userId: result.insertId,
          user: {
            id: result.insertId,
            firstName,
            lastName,
            email,
            role: normalizedRole,
            phone,
            status: 'Active',
            team: team || 'N/A',
            position: position || 'N/A'
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ User creation error:', error);
    res.status(500).json({
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  console.log('✏️ Updating user:', userId, req.body);

  try {
    const { firstName, lastName, email, phone, role, team, position, status, dateOfBirth } = req.body;

    const normalizedRole = role ? role.toLowerCase() : 'player';
    const normalizedStatus = status === 'Active' ? 'Active' : 'Inactive';

    // Update users table
    const updateUserQuery = `
      UPDATE users
      SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, role = ?, team = ?, position = ?
      WHERE id = ?
    `;

    const userValues = [firstName, lastName, phone || null, dateOfBirth || null, normalizedRole, team || 'N/A', position || 'N/A', userId];
    console.log('📝 Updating users table with values:', userValues);

    db.query(updateUserQuery, userValues, (err, result) => {
      if (err) {
        console.error('❌ Error updating users table:', err);
        return res.status(500).json({ error: 'Error updating user: ' + err.message });
      }

      console.log('✅ User updated successfully');
      res.json({
        message: 'User updated successfully',
        userId: userId
      });
    });
  } catch (error) {
    console.error('❌ User update error:', error);
    res.status(500).json({
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  console.log('🗑️ Deleting user:', userId);

  // Delete from users table
  const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
  db.query(deleteUserQuery, [userId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting from users table:', err);
      return res.status(500).json({ error: 'Error deleting user: ' + err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User deleted successfully');
    res.json({
      message: 'User deleted successfully',
      userId: userId
    });
  });
});

// Players endpoints
app.get('/api/players', (req, res) => {
  console.log('🏃 Getting all players');
  const query = 'SELECT * FROM players ORDER BY name';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching players:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    console.log(`✅ Found ${results.length} players`);
    res.json(results);
  });
});

app.get('/api/players/:id', (req, res) => {
  const { id } = req.params;
  console.log('🏃 Getting player:', id);
  const query = 'SELECT * FROM players WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching player:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(results[0]);
  });
});

// Teams endpoints
app.get('/api/teams', (req, res) => {
  console.log('⚽ Getting all teams');
  const query = 'SELECT * FROM teams ORDER BY position';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching teams:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    console.log(`✅ Found ${results.length} teams`);
    res.json(results);
  });
});

app.get('/api/standings', (req, res) => {
  console.log('📊 Getting league standings');
  const query = 'SELECT * FROM teams ORDER BY position';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching standings:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(results);
  });
});

// Fixtures endpoints
app.get('/api/fixtures', (req, res) => {
  console.log('📅 Getting all fixtures');
  const query = 'SELECT * FROM fixtures ORDER BY date, time';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching fixtures:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    console.log(`✅ Found ${results.length} fixtures`);
    res.json(results);
  });
});

app.post('/api/fixtures', (req, res) => {
  console.log('➕ Creating new fixture:', req.body);
  
  try {
    const { homeTeam, awayTeam, league, date, time, venue, referee, notes } = req.body;
    
    if (!homeTeam || !awayTeam || !date || !time) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Home team, away team, date, and time are required',
        received: { homeTeam, awayTeam, league, date, time, venue, referee, notes }
      });
    }
    
    console.log('✅ All required fields present');
    
    // Insert into fixtures table
    const insertFixtureQuery = `
      INSERT INTO fixtures (home_team, away_team, league, date, time, venue, referee, notes, status, created_by, submitted_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'Admin', ?)
    `;
    
    const fixtureValues = [
      homeTeam,
      awayTeam,
      league || 'Premier League',
      date,
      time,
      venue || null,
      referee || null,
      notes || null,
      new Date().toISOString().split('T')[0] // submitted_date
    ];
    
    console.log('📝 Inserting into fixtures table with values:', fixtureValues);
    
    db.query(insertFixtureQuery, fixtureValues, (err, result) => {
      if (err) {
        console.error('❌ Error inserting into fixtures table:', err);
        return res.status(500).json({ 
          error: 'Error creating fixture: ' + err.message,
          details: err
        });
      }
      
      console.log('✅ Successfully inserted into fixtures table, ID:', result.insertId);
      
      res.status(201).json({ 
        message: 'Fixture created successfully',
        fixtureId: result.insertId,
        fixture: {
          id: result.insertId,
          homeTeam,
          awayTeam,
          league: league || 'Premier League',
          date,
          time,
          venue,
          referee,
          notes,
          status: 'PENDING',
          createdBy: 'Admin',
          submittedDate: new Date().toISOString().split('T')[0]
        }
      });
    });
  } catch (error) {
    console.error('❌ Fixture creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

app.get('/api/results', (req, res) => {
  console.log('🏆 Getting match results');
  const query = 'SELECT * FROM fixtures WHERE status = "final" ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching results:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(results);
  });
});

// Field Bookings endpoints
app.get('/api/field-bookings', (req, res) => {
  console.log('📅 Getting all field bookings');
  const query = 'SELECT * FROM field_bookings ORDER BY date, time';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching field bookings:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    console.log(`✅ Found ${results.length} field bookings`);
    res.json(results);
  });
});

app.get('/api/field-bookings/:coachId', (req, res) => {
  const { coachId } = req.params;
  console.log('📅 Getting field bookings for coach:', coachId);
  const query = 'SELECT * FROM field_bookings WHERE coach_id = ? ORDER BY date, time';
  db.query(query, [coachId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching field bookings:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    console.log(`✅ Found ${results.length} field bookings for coach ${coachId}`);
    res.json(results);
  });
});

app.post('/api/field-bookings', (req, res) => {
  console.log('🔥 FIELD BOOKING API CALLED - Received body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { coachId, date, time, duration, field, purpose, notes } = req.body;
    
    console.log('📋 Extracted fields:', { coachId, date, time, duration, field, purpose, notes });
    
    if (!date || !time || !duration || !field || !purpose) {
      console.log('❌ Missing required fields - sending 400');
      return res.status(400).json({ 
        error: 'Date, time, duration, field, and purpose are required',
        received: { coachId, date, time, duration, field, purpose, notes }
      });
    }
    
    console.log('✅ All required fields present, proceeding with database insert');
    
    // Insert into field_bookings table
    const insertFieldBookingQuery = `
      INSERT INTO field_bookings (coach_id, date, time, duration, field, purpose, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const bookingValues = [
      coachId || null,
      date,
      time,
      duration,
      field,
      purpose,
      notes || null
    ];
    
    console.log('📝 Inserting with values:', bookingValues);
    
    db.query(insertFieldBookingQuery, bookingValues, (err, result) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ 
          error: 'Database error: ' + err.message,
          details: err
        });
      }
      
      console.log('✅ Successfully inserted, ID:', result.insertId);
      
      res.status(201).json({ 
        message: 'Field booking created successfully',
        bookingId: result.insertId,
        booking: {
          id: result.insertId,
          coachId,
          date,
          time,
          duration,
          field,
          purpose,
          notes,
          status: 'pending'
        }
      });
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

// Medical Records endpoints
app.get('/api/medical-records', (req, res) => {
  console.log('🩺 Getting all medical records');
  const query = 'SELECT * FROM medical_records ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching medical records:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    console.log(`✅ Found ${results.length} medical records`);
    res.json(results);
  });
});

app.post('/api/medical-records', (req, res) => {
  console.log('🔥 MEDICAL RECORD API CALLED - Received body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { playerId, date, type, description, doctor, status, followUpDate, restrictions, medications } = req.body;
    
    console.log('📋 Extracted fields:', { playerId, date, type, description, doctor, status, followUpDate, restrictions, medications });
    
    if (!date || !type || !description || !doctor) {
      console.log('❌ Missing required fields - sending 400');
      return res.status(400).json({ 
        error: 'Date, type, description, and doctor are required',
        received: { playerId, date, type, description, doctor, status, followUpDate, restrictions, medications }
      });
    }
    
    console.log('✅ All required fields present, proceeding with database insert');
    
    // Convert playerId to number if provided
    let playerIdNum = null;
    if (playerId) {
      playerIdNum = parseInt(playerId);
      if (isNaN(playerIdNum)) {
        console.log('❌ Invalid player ID');
        return res.status(400).json({ error: 'Player ID must be a valid number' });
      }
    }
    
    // Convert arrays to JSON strings for storage
    const restrictionsStr = restrictions && Array.isArray(restrictions) ? JSON.stringify(restrictions) : null;
    const medicationsStr = medications && Array.isArray(medications) ? JSON.stringify(medications) : null;
    
    // Insert into medical_records table
    const insertMedicalRecordQuery = `
      INSERT INTO medical_records (player_id, date, type, description, doctor, status, follow_up_date, restrictions, medications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const recordValues = [
      playerIdNum,
      date,
      type,
      description,
      doctor,
      status || 'active',
      followUpDate || null,
      restrictionsStr,
      medicationsStr
    ];
    
    console.log('📝 Inserting with values:', recordValues);
    
    db.query(insertMedicalRecordQuery, recordValues, (err, result) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ 
          error: 'Database error: ' + err.message,
          details: err
        });
      }
      
      console.log('✅ Successfully inserted, ID:', result.insertId);
      
      res.status(201).json({ 
        message: 'Medical record created successfully',
        recordId: result.insertId,
        record: {
          id: result.insertId,
          playerId,
          date,
          type,
          description,
          doctor,
          status: status || 'active',
          followUpDate,
          restrictions,
          medications
        }
      });
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

app.put('/api/medical-records/:id', (req, res) => {
  const recordId = req.params.id;
  console.log('✏️ Updating medical record:', recordId, req.body);
  
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required for update' });
    }
    
    // Update medical record status
    const updateQuery = 'UPDATE medical_records SET status = ? WHERE id = ?';
    
    db.query(updateQuery, [status, recordId], (err, result) => {
      if (err) {
        console.error('❌ Error updating medical record:', err);
        return res.status(500).json({ error: 'Error updating medical record: ' + err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Medical record not found' });
      }
      
      console.log('✅ Medical record updated successfully');
      res.json({
        message: 'Medical record updated successfully',
        recordId: recordId
      });
    });
  } catch (error) {
    console.error('❌ Medical record update error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

// Leagues endpoints
app.get('/api/leagues', (req, res) => {
  console.log('🏆 Getting all leagues');
  const query = 'SELECT * FROM leagues ORDER BY name';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching leagues:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    console.log(`✅ Found ${results.length} leagues`);
    res.json(results);
  });
});

app.get('/api/leagues/:id', (req, res) => {
  const { id } = req.params;
  console.log('🏆 Getting league:', id);
  const query = 'SELECT * FROM leagues WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching league:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }
    res.json(results[0]);
  });
});

app.post('/api/leagues', (req, res) => {
  console.log('➕ Creating new league:', req.body);
  
  try {
    const { name, description, status, totalTeams, totalMatches, currentSeason, champion, foundedYear } = req.body;
    
    if (!name) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'League name is required',
        received: { name, description, status, totalTeams, totalMatches, currentSeason, champion, foundedYear }
      });
    }
    
    console.log('✅ All required fields present');
    
    // Insert into leagues table
    const insertLeagueQuery = `
      INSERT INTO leagues (name, description, status, total_teams, total_matches, current_season, champion, founded_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const leagueValues = [
      name,
      description || null,
      status || 'active',
      totalTeams || 0,
      totalMatches || 0,
      currentSeason || '2024-2025',
      champion || null,
      foundedYear || null
    ];
    
    console.log('📝 Inserting into leagues table with values:', leagueValues);
    
    db.query(insertLeagueQuery, leagueValues, (err, result) => {
      if (err) {
        console.error('❌ Error inserting into leagues table:', err);
        return res.status(500).json({ 
          error: 'Error creating league: ' + err.message,
          details: err
        });
      }
      
      console.log('✅ Successfully inserted into leagues table, ID:', result.insertId);
      
      res.status(201).json({ 
        message: 'League created successfully',
        leagueId: result.insertId,
        league: {
          id: result.insertId,
          name,
          description,
          status: status || 'active',
          totalTeams: totalTeams || 0,
          totalMatches: totalMatches || 0,
          currentSeason: currentSeason || '2024-2025',
          champion,
          foundedYear
        }
      });
    });
  } catch (error) {
    console.error('❌ League creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

app.put('/api/leagues/:id', (req, res) => {
  const leagueId = req.params.id;
  console.log('✏️ Updating league:', leagueId, req.body);
  
  try {
    const { name, description, status, totalTeams, totalMatches, currentSeason, champion, foundedYear } = req.body;
    
    // Update leagues table
    const updateLeagueQuery = `
      UPDATE leagues
      SET name = ?, description = ?, status = ?, total_teams = ?, total_matches = ?, current_season = ?, champion = ?, founded_year = ?
      WHERE id = ?
    `;
    
    const leagueValues = [
      name,
      description || null,
      status,
      totalTeams,
      totalMatches,
      currentSeason,
      champion || null,
      foundedYear || null,
      leagueId
    ];
    
    console.log('📝 Updating leagues table with values:', leagueValues);
    
    db.query(updateLeagueQuery, leagueValues, (err, result) => {
      if (err) {
        console.error('❌ Error updating leagues table:', err);
        return res.status(500).json({ error: 'Error updating league: ' + err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'League not found' });
      }
      
      console.log('✅ League updated successfully');
      res.json({
        message: 'League updated successfully',
        leagueId: leagueId
      });
    });
  } catch (error) {
    console.error('❌ League update error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

app.delete('/api/leagues/:id', (req, res) => {
  const leagueId = req.params.id;
  console.log('🗑️ Deleting league:', leagueId);
  
  // Delete from leagues table
  const deleteLeagueQuery = 'DELETE FROM leagues WHERE id = ?';
  db.query(deleteLeagueQuery, [leagueId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting from leagues table:', err);
      return res.status(500).json({ error: 'Error deleting league: ' + err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    console.log('✅ League deleted successfully');
    res.json({
      message: 'League deleted successfully',
      leagueId: leagueId
    });
  });
});

// Venues endpoints
app.get('/api/venues', (req, res) => {
  console.log('🏟️ Getting all venues');
  const query = 'SELECT * FROM venues ORDER BY name';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching venues:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    
    // Parse JSON fields
    results.forEach(venue => {
      try {
        if (venue.facilities) venue.facilities = JSON.parse(venue.facilities);
      } catch (e) { venue.facilities = []; }
      try {
        if (venue.fields) venue.fields = JSON.parse(venue.fields);
      } catch (e) { venue.fields = []; }
    });
    
    console.log(`✅ Found ${results.length} venues`);
    res.json(results);
  });
});

app.get('/api/venues/:id', (req, res) => {
  const { id } = req.params;
  console.log('🏟️ Getting venue:', id);
  const query = 'SELECT * FROM venues WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching venue:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    // Parse JSON fields
    const venue = results[0];
    try {
      if (venue.facilities) venue.facilities = JSON.parse(venue.facilities);
    } catch (e) { venue.facilities = []; }
    try {
      if (venue.fields) venue.fields = JSON.parse(venue.fields);
    } catch (e) { venue.fields = []; }
    
    res.json(venue);
  });
});

app.post('/api/venues', (req, res) => {
  console.log('➕ Creating new venue:', req.body);
  
  try {
    const { name, address, capacity, type, surface, status, facilities, manager, managerPhone, managerEmail, fields } = req.body;
    
    if (!name || !address || !capacity || !type) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Name, address, capacity, and type are required',
        received: { name, address, capacity, type, surface, status, facilities, manager, managerPhone, managerEmail, fields }
      });
    }
    
    console.log('✅ All required fields present');
    
    // Convert arrays to JSON strings for storage
    const facilitiesStr = facilities && Array.isArray(facilities) ? JSON.stringify(facilities) : null;
    const fieldsStr = fields && Array.isArray(fields) ? JSON.stringify(fields) : null;
    
    // Insert into venues table
    const insertVenueQuery = `
      INSERT INTO venues (name, address, capacity, type, surface, status, facilities, manager, manager_phone, manager_email, fields, last_maintenance, next_maintenance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const venueValues = [
      name,
      address,
      capacity,
      type,
      surface || 'Natural Grass',
      status || 'Active',
      facilitiesStr,
      manager || null,
      managerPhone || null,
      managerEmail || null,
      fieldsStr,
      new Date().toISOString().split('T')[0], // last_maintenance
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // next_maintenance
    ];
    
    console.log('📝 Inserting into venues table with values:', venueValues);
    
    db.query(insertVenueQuery, venueValues, (err, result) => {
      if (err) {
        console.error('❌ Error inserting into venues table:', err);
        return res.status(500).json({ 
          error: 'Error creating venue: ' + err.message,
          details: err
        });
      }
      
      console.log('✅ Successfully inserted into venues table, ID:', result.insertId);
      
      res.status(201).json({ 
        message: 'Venue created successfully',
        venueId: result.insertId,
        venue: {
          id: result.insertId,
          name,
          address,
          capacity,
          type,
          surface: surface || 'Natural Grass',
          status: status || 'Active',
          facilities,
          manager,
          managerPhone,
          managerEmail,
          fields,
          bookings: 0,
          lastMaintenance: new Date().toISOString().split('T')[0],
          nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
    });
  } catch (error) {
    console.error('❌ Venue creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

app.put('/api/venues/:id', (req, res) => {
  const venueId = req.params.id;
  console.log('✏️ Updating venue:', venueId, req.body);
  
  try {
    const { name, address, capacity, type, surface, status, facilities, manager, managerPhone, managerEmail, fields } = req.body;
    
    // Convert arrays to JSON strings for storage
    const facilitiesStr = facilities && Array.isArray(facilities) ? JSON.stringify(facilities) : null;
    const fieldsStr = fields && Array.isArray(fields) ? JSON.stringify(fields) : null;
    
    // Update venues table
    const updateVenueQuery = `
      UPDATE venues
      SET name = ?, address = ?, capacity = ?, type = ?, surface = ?, status = ?, facilities = ?, manager = ?, manager_phone = ?, manager_email = ?, fields = ?
      WHERE id = ?
    `;
    
    const venueValues = [
      name,
      address,
      capacity,
      type,
      surface,
      status,
      facilitiesStr,
      manager || null,
      managerPhone || null,
      managerEmail || null,
      fieldsStr,
      venueId
    ];
    
    console.log('📝 Updating venues table with values:', venueValues);
    
    db.query(updateVenueQuery, venueValues, (err, result) => {
      if (err) {
        console.error('❌ Error updating venues table:', err);
        return res.status(500).json({ error: 'Error updating venue: ' + err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Venue not found' });
      }
      
      console.log('✅ Venue updated successfully');
      res.json({
        message: 'Venue updated successfully',
        venueId: venueId
      });
    });
  } catch (error) {
    console.error('❌ Venue update error:', error);
    res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

app.delete('/api/venues/:id', (req, res) => {
  const venueId = req.params.id;
  console.log('🗑️ Deleting venue:', venueId);
  
  // Delete from venues table
  const deleteVenueQuery = 'DELETE FROM venues WHERE id = ?';
  db.query(deleteVenueQuery, [venueId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting from venues table:', err);
      return res.status(500).json({ error: 'Error deleting venue: ' + err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    console.log('✅ Venue deleted successfully');
    res.json({
      message: 'Venue deleted successfully',
      venueId: venueId
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database: nwusoccer (localhost)`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📝 Register endpoint: http://localhost:${PORT}/api/register`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/login`);
  console.log(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
  console.log(`🏃 Players endpoint: http://localhost:${PORT}/api/players`);
  console.log(`⚽ Teams endpoint: http://localhost:${PORT}/api/teams`);
  console.log(`📅 Fixtures endpoint: http://localhost:${PORT}/api/fixtures`);
  console.log(`🏟️ Field bookings endpoint: http://localhost:${PORT}/api/field-bookings`);
  console.log(`🩺 Medical records endpoint: http://localhost:${PORT}/api/medical-records`);
  console.log(`🏆 Leagues endpoint: http://localhost:${PORT}/api/leagues`);
  console.log(`🏟️ Venues endpoint: http://localhost:${PORT}/api/venues`);
});

module.exports = app;

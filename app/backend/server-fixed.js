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
    'DROP TABLE IF EXISTS register_table'
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
});

module.exports = app;

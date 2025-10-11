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

// Field bookings endpoints
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

app.post('/api/field-bookings', (req, res) => {
  console.log('➕ Creating new field booking:', req.body);

  try {
    const { id, date, time, duration, field, purpose, status, notes, created_by } = req.body;

    if (!id || !date || !time || !duration || !field || !purpose) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        error: 'Required fields: id, date, time, duration, field, purpose',
        received: { id, date, time, duration, field, purpose, status, notes, created_by }
      });
    }

    console.log('✅ All required fields present');

    const query = `
      INSERT INTO field_bookings (id, date, time, duration, field, purpose, status, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      date = VALUES(date),
      time = VALUES(time),
      duration = VALUES(duration),
      field = VALUES(field),
      purpose = VALUES(purpose),
      status = VALUES(status),
      notes = VALUES(notes),
      updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
      id,
      date,
      time,
      duration,
      field,
      purpose,
      status || 'pending',
      notes || '',
      created_by || ''
    ];

    console.log('📝 Inserting into field_bookings table with values:', values);

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Error creating/updating field booking:', err);
        return res.status(500).json({
          error: 'Error creating field booking: ' + err.message,
          details: err
        });
      }

      const message = result.affectedRows === 1 && result.insertId > 0
        ? 'Field booking created successfully'
        : 'Field booking updated successfully';

      console.log('✅ Successfully created/updated field booking, ID:', id);

      res.status(201).json({
        message,
        id: id
      });
    });
  } catch (error) {
    console.error('❌ Field booking creation error:', error);
    res.status(500).json({
      error: 'Internal server error: ' + error.message,
      details: error
    });
  }
});

// Medical records endpoints
app.get('/api/medical-records', (req, res) => {
  console.log('🏥 Getting all medical records');
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
  console.log('➕ Creating new medical record:', req.body);

  try {
    const {
      player_id,
      player_name,
      date,
      type,
      description,
      doctor,
      status,
      follow_up_date,
      restrictions,
      medications,
      created_by
    } = req.body;

    if (!player_id || !date || !type || !description || !doctor) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        error: 'Required fields: player_id, date, type, description, doctor',
        received: { player_id, player_name, date, type, description, doctor, status, follow_up_date, restrictions, medications, created_by }
      });
    }

    console.log('✅ All required fields present');

    const query = `
      INSERT INTO medical_records (player_id, player_name, date, type, description, doctor, status, follow_up_date, restrictions, medications, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      player_id,
      player_name || '',
      date,
      type,
      description,
      doctor,
      status || 'active',
      follow_up_date || null,
      JSON.stringify(restrictions || []),
      JSON.stringify(medications || []),
      created_by || ''
    ];

    console.log('📝 Inserting into medical_records table with values:', values);

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Error creating medical record:', err);
        return res.status(500).json({
          error: 'Error creating medical record: ' + err.message,
          details: err
        });
      }

      console.log('✅ Successfully inserted into medical_records table, ID:', result.insertId);

      res.status(201).json({
        message: 'Medical record created successfully',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('❌ Medical record creation error:', error);
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
      console.log('❌ Missing status field');
      return res.status(400).json({ error: 'Status is required' });
    }

    const query = 'UPDATE medical_records SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

    db.query(query, [status, recordId], (err, result) => {
      if (err) {
        console.error('❌ Error updating medical record:', err);
        return res.status(500).json({ error: 'Error updating medical record: ' + err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      console.log('✅ Medical record updated successfully');
      res.json({
        message: 'Medical record updated successfully'
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

  // Create field bookings table
  const createFieldBookingsTable = `
    CREATE TABLE IF NOT EXISTS field_bookings (
      id VARCHAR(50) PRIMARY KEY,
      date DATE NOT NULL,
      time TIME NOT NULL,
      duration DECIMAL(3,1) NOT NULL,
      field VARCHAR(255) NOT NULL,
      purpose VARCHAR(255) NOT NULL,
      status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
      notes TEXT,
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  // Create medical records table
  const createMedicalRecordsTable = `
    CREATE TABLE IF NOT EXISTS medical_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      player_id VARCHAR(50) NOT NULL,
      player_name VARCHAR(255),
      date DATE NOT NULL,
      type ENUM('checkup', 'injury', 'treatment', 'clearance') NOT NULL,
      description TEXT NOT NULL,
      doctor VARCHAR(255) NOT NULL,
      status ENUM('active', 'resolved', 'ongoing') DEFAULT 'active',
      follow_up_date DATE,
      restrictions JSON,
      medications JSON,
      created_by VARCHAR(255),
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

  db.query(createFieldBookingsTable, (err) => {
    if (err) {
      console.error('Error creating field_bookings table:', err);
    } else {
      console.log('✅ field_bookings table created successfully');
    }
  });

  db.query(createMedicalRecordsTable, (err) => {
    if (err) {
      console.error('Error creating medical_records table:', err);
    } else {
      console.log('✅ medical_records table created successfully');
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

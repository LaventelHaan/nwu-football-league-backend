const express = require('express');
const cors = require('cors');
require('dotenv').config();

const matchStatsRoutes = require('./Match Stats Routes/RoutesMatchStats');
const teamRoutes = require('./Team Routes/RoutesTeam');
const fixtureRoutes = require('./Fixture Routes/RoutesFixture');
const announcementsRoutes = require('./Announcements Routes/announcements'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple authentication mock (add this middleware)
app.use((req, res, next) => {
  // For testing, you can pass user_id in headers
  // In production, use JWT or session-based auth
  req.user = {
    user_id: req.headers['user-id'] || 1 // Default to user_id 1 for testing
  };
  next();
});

// Routes
app.use('/api', matchStatsRoutes);
app.use('/api', teamRoutes);
app.use('/api', fixtureRoutes);
app.use('/api/announcements', announcementsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'NWU Sports League API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

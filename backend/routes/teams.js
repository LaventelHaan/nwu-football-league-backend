const express = require('express');
const router = express.Router();

const { mockTeams } = require('../../lib/mockData.js');

// GET all teams
router.get('/', (req, res) => {
  res.json(mockTeams);
});

// GET team by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const team = mockTeams.find(t => t.id === id);
  if (team) {
    res.json(team);
  } else {
    res.status(404).json({ error: 'Team not found' });
  }
});

module.exports = router;

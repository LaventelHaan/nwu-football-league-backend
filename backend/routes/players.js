const express = require('express');
const router = express.Router();

let { mockPlayers } = require('../../lib/mockData.js');

// GET all players
router.get('/', (req, res) => {
  res.json(mockPlayers);
});

// GET player by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const player = mockPlayers.find(p => p.id === id);
  if (player) {
    res.json(player);
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});


// CREATE player
router.post('/', (req, res) => {
  const newPlayer = req.body;
  newPlayer.id = mockPlayers.length ? Math.max(...mockPlayers.map(p => p.id)) + 1 : 1;
  mockPlayers.push(newPlayer);
  res.status(201).json(newPlayer);
});

// UPDATE player
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = mockPlayers.findIndex(p => p.id === id);
  if (idx !== -1) {
    mockPlayers[idx] = { ...mockPlayers[idx], ...req.body, id };
    res.json(mockPlayers[idx]);
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});

// DELETE player
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = mockPlayers.findIndex(p => p.id === id);
  if (idx !== -1) {
    const deleted = mockPlayers.splice(idx, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});

module.exports = router;

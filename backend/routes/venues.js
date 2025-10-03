const express = require('express');
const router = express.Router();

// Placeholder: Replace with your actual venues array if available
const venues = [
  { id: 1, name: 'NWU Stadium', location: 'Potchefstroom', capacity: 10000 },
  { id: 2, name: 'Wits Stadium', location: 'Johannesburg', capacity: 8000 },
  { id: 3, name: 'UCT Grounds', location: 'Cape Town', capacity: 7000 },
  { id: 4, name: 'UJ Stadium', location: 'Johannesburg', capacity: 9000 },
  { id: 5, name: 'Rhodes Park', location: 'Grahamstown', capacity: 5000 },
];

// GET all venues
router.get('/', (req, res) => {
  res.json(venues);
});

// GET venue by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const venue = venues.find(v => v.id === id);
  if (venue) {
    res.json(venue);
  } else {
    res.status(404).json({ error: 'Venue not found' });
  }
});


// CREATE venue
router.post('/', (req, res) => {
  const newVenue = req.body;
  newVenue.id = venues.length ? Math.max(...venues.map(v => v.id)) + 1 : 1;
  venues.push(newVenue);
  res.status(201).json(newVenue);
});

// UPDATE venue
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = venues.findIndex(v => v.id === id);
  if (idx !== -1) {
    venues[idx] = { ...venues[idx], ...req.body, id };
    res.json(venues[idx]);
  } else {
    res.status(404).json({ error: 'Venue not found' });
  }
});

// DELETE venue
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = venues.findIndex(v => v.id === id);
  if (idx !== -1) {
    const deleted = venues.splice(idx, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Venue not found' });
  }
});

module.exports = router;

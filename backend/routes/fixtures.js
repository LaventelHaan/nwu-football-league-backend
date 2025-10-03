const express = require('express');
const router = express.Router();


// Use mockFixtures and mockResults from mockData
let { mockFixtures, mockResults } = require('../../lib/mockData.js');


// GET all fixtures (upcoming)
router.get('/', (req, res) => {
  res.json(mockFixtures);
});

// GET a single fixture by ID (search both fixtures and results)
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const fixture = mockFixtures.find(f => f.id === id) || mockResults.find(r => r.id === id);
  if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
  res.json(fixture);
});

// CREATE a new fixture (upcoming)
router.post('/', (req, res) => {
  const newFixture = req.body;
  newFixture.id = mockFixtures.length ? Math.max(...mockFixtures.map(f => f.id)) + 1 : 1;
  mockFixtures.push(newFixture);
  res.status(201).json(newFixture);
});

// UPDATE a fixture (upcoming or result)
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let fixture = mockFixtures.find(f => f.id === id);
  if (fixture) {
    Object.assign(fixture, req.body, { id });
    return res.json(fixture);
  }
  let result = mockResults.find(r => r.id === id);
  if (result) {
    Object.assign(result, req.body, { id });
    return res.json(result);
  }
  res.status(404).json({ error: 'Fixture not found' });
});

// DELETE a fixture (upcoming or result)
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let idx = mockFixtures.findIndex(f => f.id === id);
  if (idx !== -1) {
    const deleted = mockFixtures.splice(idx, 1);
    return res.json(deleted[0]);
  }
  idx = mockResults.findIndex(r => r.id === id);
  if (idx !== -1) {
    const deleted = mockResults.splice(idx, 1);
    return res.json(deleted[0]);
  }
  res.status(404).json({ error: 'Fixture not found' });
});

module.exports = router;

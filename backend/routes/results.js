const express = require('express');
const router = express.Router();

// Import or define mockResults here
const { mockResults } = require('../../lib/mockData.js');

// GET all results
router.get('/', (req, res) => {
  res.json(mockResults);
});

// GET result by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = mockResults.find(f => f.id === id);
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'Result not found' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

const { mockStandings } = require('../../lib/mockData');

// GET all standings
router.get('/', (req, res) => {
  res.json(mockStandings);
});

module.exports = router;

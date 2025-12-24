const express = require('express');
const router = express.Router();

const { mockAnnouncements } = require('../../lib/mockData');

// GET all announcements
router.get('/', (req, res) => {
  res.json(mockAnnouncements);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all venues
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM venues');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single venue by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM venues WHERE venue_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new venue
router.post('/', async (req, res) => {
  const { name, address, city, capacity, surface, is_active } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO venues (name, address, city, capacity, surface, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [name, address, city, capacity, surface, is_active ?? true]
    );
    res.status(201).json({ venue_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a venue
router.put('/:id', async (req, res) => {
  const { name, address, city, capacity, surface, is_active } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE venues SET name=?, address=?, city=?, capacity=?, surface=?, is_active=? WHERE venue_id=?',
      [name, address, city, capacity, surface, is_active, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json({ message: 'Venue updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a venue
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM venues WHERE venue_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json({ message: 'Venue deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

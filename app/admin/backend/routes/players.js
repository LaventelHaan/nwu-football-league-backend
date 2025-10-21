const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all players (with user profile info)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, up.first_name, up.last_name, up.birth_date, up.bio, u.email, u.phone_e164
      FROM players p
      JOIN user_profiles up ON up.user_id = p.user_id
      JOIN users u ON u.user_id = p.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single player by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, up.first_name, up.last_name, up.birth_date, up.bio, u.email, u.phone_e164
      FROM players p
      JOIN user_profiles up ON up.user_id = p.user_id
      JOIN users u ON u.user_id = p.user_id
      WHERE p.player_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Player not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new player (requires user_id to exist)
router.post('/', async (req, res) => {
  const { user_id, dominant_foot, height_cm, preferred_position } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO players (user_id, dominant_foot, height_cm, preferred_position) VALUES (?, ?, ?, ?)',
      [user_id, dominant_foot, height_cm, preferred_position]
    );
    res.status(201).json({ player_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a player
router.put('/:id', async (req, res) => {
  const { dominant_foot, height_cm, preferred_position } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE players SET dominant_foot=?, height_cm=?, preferred_position=? WHERE player_id=?',
      [dominant_foot, height_cm, preferred_position, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Player not found' });
    res.json({ message: 'Player updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a player
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM players WHERE player_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Player not found' });
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

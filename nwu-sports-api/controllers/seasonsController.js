import teamsDB from '../models/teamsDB.js';

// Get the current season
export const getCurrentSeason = async (req, res) => {
  try {
    const [rows] = await teamsDB.query(
      `SELECT * FROM seasons ORDER BY start_date DESC LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No season found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching current season:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
import teamsDB from '../models/teamsDB.js';

export const getSeasons = async (req, res) => {
  try {
    const [rows] = await teamsDB.query(
      'SELECT season_id, name, start_date, end_date FROM seasons ORDER BY start_date DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching seasons:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
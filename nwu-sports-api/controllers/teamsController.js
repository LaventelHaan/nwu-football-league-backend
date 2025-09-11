import teamsDB from '../models/teamsDB.js';

// Fetch all teams from the database
export const getAllTeams = async (req, res) => {
  try {
    const [rows] = await teamsDB.query('SELECT * FROM teams');
    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Fetch a single team by its ID
export const getTeamById = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await teamsDB.query(
      'SELECT * FROM teams WHERE team_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('Error fetching team by ID:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Fetch league standings for a specific league
export const getLeagueStandings = async (req, res) => {
  try {
    const [rows] = await teamsDB.query(
      `
      SELECT  
        ts.position,
        t.name AS team,
        ts.played,
        ts.wins,
        ts.draws,
        ts.losses,
        ts.goalsFor,
        ts.goalsAgainst,
        ts.goalDifference,
        ts.points,
        ts.trend,
        ts.form
      FROM team_stats ts
      JOIN teams t ON ts.team_id = t.team_id
      WHERE ts.league_id = ?
      ORDER BY ts.position ASC
      `,
      [1]
    );

    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching league standings:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

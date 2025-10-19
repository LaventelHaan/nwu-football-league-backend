import teamsDB from '../models/teamsDB.js';

// Get all teams
export const getAllTeams = async (req, res) => {
  try {
    const [rows] = await teamsDB.query('SELECT * FROM teams');
    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get team by ID
export const getTeamById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await teamsDB.query('SELECT * FROM teams WHERE team_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    console.error('Error fetching team by ID:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get league standings with season name
export const getStandingsTable = async (req, res) => {
  try {
    const [seasonRows] = await teamsDB.query(
      'SELECT name FROM seasons ORDER BY start_date DESC LIMIT 1'
    );
    const seasonName = seasonRows.length > 0 ? seasonRows[0].name : 'Unknown Season';

    const [teamRows] = await teamsDB.query(
      `SELECT 
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
      ORDER BY ts.position ASC`,
      [1]
    );

    const parsedTeams = teamRows.map((team) => ({
      ...team,
      form: (() => {
        try {
          return typeof team.form === 'string'
            ? JSON.parse(team.form)
            : Array.isArray(team.form)
            ? team.form
            : [];
        } catch {
          return [];
        }
      })(),
    }));

    res.json({ season: seasonName, data: parsedTeams });
  } catch (err) {
    console.error('Error fetching standings:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
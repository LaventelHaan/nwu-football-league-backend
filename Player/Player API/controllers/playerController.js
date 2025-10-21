import pool from '../models/db.js'

// Get player by email address
export const getPlayerByEmail = async (req, res) => {
  const email = req.params.email

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        u.user_id AS player_id,
        CONCAT(p.first_name, ' ', p.last_name) AS name,
        u.email,
        t.name AS team,
		t.team_id AS teamId,
        s.matches_played AS gamesPlayed,
        s.goals,
        s.assists,
        s.pass_accuracy AS performance
      FROM users u
      JOIN user_profiles p ON u.user_id = p.user_id
      JOIN user_roles r ON u.user_id = r.user_id
      JOIN teams t ON r.role_id = t.team_id
      JOIN player_stats s ON u.user_id = s.player_id
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    )

    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      res.status(404).json({ error: 'Player not found' })
    }
  } catch (err) {
    console.error('Error fetching player:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
};

// Get player invites by id
export const getInvitesByPlayerId = async (req, res) => {
  const playerId = req.params.id

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        ti.invitation_id AS id,
        CONCAT(up.first_name, ' ', up.last_name) AS scouterName,
        ti.message,
        te.team_id AS teamId,
        ti.sent_at AS createdAt,
        ti.status AS status
      FROM trial_invitations ti
      JOIN trial_events te ON ti.trial_id = te.trial_id
      JOIN users scout ON ti.scout_user_id = scout.user_id
      JOIN user_profiles up ON scout.user_id = up.user_id
      WHERE ti.player_id = ?
      ORDER BY ti.sent_at DESC
      `,
      [playerId]
    )

    res.json(rows)
  } catch (err) {
    console.error('Error fetching invites:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
};

// Update invite status
export const updateInviteStatus = async (req, res) => {
  const inviteId = req.params.id
  const { status } = req.body

  try {
    await pool.query(
      `UPDATE trial_invitations SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE invitation_id = ?`,
      [status, inviteId]
    )

    res.json({ success: true })
  } catch (err) {
    console.error('Error updating invite status:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
};

// Get announcements by player id
export const getAnnouncementsByPlayerId = async (req, res) => {
  const playerId = req.params.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        n.notification_id AS id,
        n.title,
        n.body AS message,
        n.type_key AS priority,
        n.created_at AS date
      FROM notifications n
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      `,
      [playerId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get fixtures by player id
export const getFixturesByPlayerId = async (req, res) => {
  const playerId = req.params.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        f.fixture_id AS id,
        f.scheduled_at AS datetime,
        l.name AS league,
        ht.name AS homeTeam,
        at.name AS awayTeam,
        ht.team_id AS homeTeamId,
        at.team_id AS awayTeamId
      FROM match_lineups ml
      JOIN matches m ON ml.match_id = m.match_id
      JOIN fixtures f ON m.fixture_id = f.fixture_id
      JOIN teams ht ON f.home_team_id = ht.team_id
      JOIN teams at ON f.away_team_id = at.team_id
      JOIN leagues l ON f.league_id = l.league_id
      WHERE ml.player_id = ?
      ORDER BY f.scheduled_at ASC
      `,
      [playerId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching fixtures:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get fixture data
export const getFixtureDetails = async (req, res) => {
  const fixtureId = req.params.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
		  f.fixture_id AS id,
		  f.scheduled_at,
		  f.league_id,
		  f.created_by,
		  f.approval_status,
		  CONCAT(up.first_name, ' ', up.last_name) AS approved_by_name,
		  f.approved_at,
		  ht.team_id AS home_team_id,
		  ht.name AS home_team,
		  at.team_id AS away_team_id,
		  at.name AS away_team,
		  vf.field_id,
		  vf.name AS field_name,
		  v.venue_id,
		  v.name AS venue_name,
		  v.city,
		  v.address,
		  v.capacity,
		  v.surface
		FROM fixtures f
		JOIN teams ht ON f.home_team_id = ht.team_id
		JOIN teams at ON f.away_team_id = at.team_id
		LEFT JOIN venue_fields vf ON f.venue_field_id = vf.field_id
		LEFT JOIN venues v ON vf.venue_id = v.venue_id
		LEFT JOIN user_profiles up ON f.approved_by = up.user_id
		WHERE f.fixture_id = ?
      `,
      [fixtureId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Fixture not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching fixture details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
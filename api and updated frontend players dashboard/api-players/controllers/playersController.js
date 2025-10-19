import pool from '../models/db.js';

export const getAllPlayers = async (req, res) => {
  try {
    const leagueId = 4; // or dynamically from req.query.league_id

    const [rows] = await pool.query(
      `
      SELECT 
		  DISTINCT p.player_id,
		  CONCAT(up.first_name, ' ', up.last_name) AS name,
		  up.avatar,
		  up.nationality,
		  TIMESTAMPDIFF(YEAR, up.birth_date, CURDATE()) AS age,
		  up.bio,
		  p.dominant_foot,
		  p.preferred_position AS position,
		  p.strengths,
		  p.weaknesses,
		  p.areas_for_improvement,
		  p.overall_rating,
		  p.estimatedValue,
		  p.potential,
		  p.physicalAttributes,
		  p.technicalSkills,
		  p.mentalAttributes,
		  ps.matches_played AS appearances,
		  ps.goals,
		  ps.assists,
		  ps.yellow_cards AS yellowCards,
		  t.name AS team,
		  tm.squad_number,
		  tm.joined_at AS joinDate,
		  COALESCE(cs.cleanSheets, 0) AS cleanSheets
		FROM players p
		JOIN user_profiles up ON p.user_id = up.user_id
		JOIN player_stats ps ON p.player_id = ps.player_id
		JOIN (
		  SELECT player_id, MAX(joined_at) AS latest_join
		  FROM team_memberships
		  WHERE left_at IS NULL AND approval_status = 'APPROVED'
		  GROUP BY player_id
		) latest_tm ON p.player_id = latest_tm.player_id
		JOIN team_memberships tm ON tm.player_id = latest_tm.player_id AND tm.joined_at = latest_tm.latest_join
		JOIN teams t ON tm.team_id = t.team_id
		LEFT JOIN (
		  SELECT
			ml.player_id,
			COUNT(*) AS cleanSheets
		  FROM match_lineups ml
		  JOIN match_stats ms ON ml.match_id = ms.match_id
		  JOIN team_memberships tm2 ON tm2.player_id = ml.player_id AND tm2.left_at IS NULL AND tm2.approval_status = 'APPROVED'
		  WHERE ml.position_key = 'GK'
			AND (
			  (ml.team_id = tm2.team_id AND ms.away_goals = 0) OR
			  (ml.team_id != tm2.team_id AND ms.home_goals = 0)
			)
		  GROUP BY ml.player_id
		) cs ON p.player_id = cs.player_id
		WHERE ps.league_id = ?;  
		`,
      [leagueId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching player data:', error);
    res.status(500).json({ error: 'Failed to fetch player profiles' });
  }
};

export const getTopPerformers = async (req, res) => {
  try {
    const [topScorer] = await pool.query(`
      SELECT 
        p.player_id,
        CONCAT(up.first_name, ' ', up.last_name) AS name,
        up.avatar,
        t.name AS team,
        ps.goals
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.player_id
      JOIN user_profiles up ON p.user_id = up.user_id
      JOIN team_memberships tm ON p.player_id = tm.player_id
      JOIN teams t ON tm.team_id = t.team_id
      WHERE tm.left_at IS NULL AND tm.approval_status = 'APPROVED'
      ORDER BY ps.goals DESC
      LIMIT 1;
    `);

    const [mostAssists] = await pool.query(`
      SELECT 
        p.player_id,
        CONCAT(up.first_name, ' ', up.last_name) AS name,
        up.avatar,
        t.name AS team,
        ps.assists
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.player_id
      JOIN user_profiles up ON p.user_id = up.user_id
      JOIN team_memberships tm ON p.player_id = tm.player_id
      JOIN teams t ON tm.team_id = t.team_id
      WHERE tm.left_at IS NULL AND tm.approval_status = 'APPROVED'
      ORDER BY ps.assists DESC
      LIMIT 1;
    `);

    const [mostAppearances] = await pool.query(`
      SELECT 
        p.player_id,
        CONCAT(up.first_name, ' ', up.last_name) AS name,
        up.avatar,
        t.name AS team,
        ps.matches_played AS appearances
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.player_id
      JOIN user_profiles up ON p.user_id = up.user_id
      JOIN team_memberships tm ON p.player_id = tm.player_id
      JOIN teams t ON tm.team_id = t.team_id
      WHERE tm.left_at IS NULL AND tm.approval_status = 'APPROVED'
      ORDER BY ps.matches_played DESC
      LIMIT 1;
    `);

    res.json({ topScorer: topScorer[0], mostAssists: mostAssists[0], mostAppearances: mostAppearances[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
};

export const getPlayerById = async (req, res) => {
  const { player_id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        p.player_id,
        CONCAT(up.first_name, ' ', up.last_name) AS name,
        up.avatar,
        up.nationality,
        TIMESTAMPDIFF(YEAR, up.birth_date, CURDATE()) AS age,
        up.height,
        up.weight,
        up.bio AS biography,
        p.previous_team AS previousTeam,
        p.preferred_position AS position,
        p.dominant_foot,
        p.strengths,
        p.weaknesses,
        p.areas_for_improvement,
        p.overall_rating,
        p.estimatedValue,
        p.potential,
        p.physicalAttributes,
        p.technicalSkills,
        p.mentalAttributes,
        t.name AS team,
        tm.squad_number,
        tm.joined_at AS joinDate,
        ps.matches_played AS appearances,
        ps.goals,
        ps.assists,
        ps.minutes_played,
        ps.yellow_cards AS yellowCards,
        ps.red_cards AS redCards,
        ps.pass_accuracy,
        ps.shots_on_target,
        ps.dribbles_completed,
        ps.recentForm
      FROM players p
      JOIN user_profiles up ON p.user_id = up.user_id
      JOIN player_stats ps ON p.player_id = ps.player_id
      JOIN (
        SELECT player_id, MAX(joined_at) AS latest_join
        FROM team_memberships
        WHERE left_at IS NULL AND approval_status = 'APPROVED'
        GROUP BY player_id
      ) latest_tm ON p.player_id = latest_tm.player_id
      JOIN team_memberships tm ON tm.player_id = latest_tm.player_id AND tm.joined_at = latest_tm.latest_join
      JOIN teams t ON tm.team_id = t.team_id
      WHERE p.player_id = ?;
      `,
      [player_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = rows[0];

    // Wrap seasonStats
    player.seasonStats = {
      minutesPlayed: player.minutes_played,
      goalsPerGame: player.appearances ? (player.goals / player.appearances).toFixed(2) : 0,
      passAccuracy: player.pass_accuracy,
      shotsOnTarget: player.shots_on_target,
      dribblesCompleted: player.dribbles_completed,
    };

    delete player.minutes_played;
    delete player.pass_accuracy;
    delete player.shots_on_target;
    delete player.dribbles_completed;

    if (Array.isArray(player.recentForm)) {
    } else if (typeof player.recentForm === 'string') {
      try {
        player.recentForm = JSON.parse(player.recentForm);
      } catch {
        player.recentForm = [];
      }
    } else {
      player.recentForm = [];
    }

    const [achievements] = await pool.query(
      `
      SELECT title
      FROM player_achievements
      WHERE player_id = ?
      ORDER BY awarded_at DESC;
      `,
      [player_id]
    );

    player.achievements = achievements.map(a => a.title);

    res.json(player);
  } catch (error) {
    console.error('Error fetching player profile:', error);
    res.status(500).json({ error: 'Failed to fetch player profile' });
  }
};
const db = require('../config/database');

const MatchStats = {
  // Get completed matches with basic info
  getCompletedMatches: (limit = 10, callback) => {
    const query = `
      SELECT 
        m.match_id,
        f.fixture_id,
        l.league_id,
        l.name AS league_name,
        s.season_id,
        s.name AS season_name,
        ht.team_id AS home_team_id,
        ht.name AS home_team_name,
        at.team_id AS away_team_id,
        at.name AS away_team_name,
        m.home_score,
        m.away_score,
        m.status_key,
        m.started_at,
        m.ended_at,
        v.name AS venue_name,
        vf.name AS field_name,
        f.scheduled_at,
        ms.home_yellow,
        ms.home_red,
        ms.away_yellow,
        ms.away_red,
        ms.man_ot_match,
        p.player_id AS motm_player_id,
        up.first_name AS motm_first_name,
        up.last_name AS motm_last_name
      FROM matches m
      JOIN fixtures f ON m.fixture_id = f.fixture_id
      JOIN leagues l ON f.league_id = l.league_id
      JOIN seasons s ON l.season_id = s.season_id
      JOIN teams ht ON f.home_team_id = ht.team_id
      JOIN teams at ON f.away_team_id = at.team_id
      LEFT JOIN venue_fields vf ON f.venue_field_id = vf.field_id
      LEFT JOIN venues v ON vf.venue_id = v.venue_id
      LEFT JOIN match_stats ms ON m.match_id = ms.match_id
      LEFT JOIN players p ON ms.man_ot_match = p.player_id
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE m.status_key = 'FINAL'
      ORDER BY m.ended_at DESC
      LIMIT ?
    `;
    
    db.query(query, [limit], callback);
  },

  // Get detailed match information by ID
  getMatchById: (matchId, callback) => {
    const query = `
      SELECT 
        m.match_id,
        f.fixture_id,
        l.league_id,
        l.name AS league_name,
        s.season_id,
        s.name AS season_name,
        ht.team_id AS home_team_id,
        ht.name AS home_team_name,
        at.team_id AS away_team_id,
        at.name AS away_team_name,
        m.home_score,
        m.away_score,
        m.status_key,
        m.started_at,
        m.ended_at,
        v.name AS venue_name,
        vf.name AS field_name,
        f.scheduled_at,
        ms.home_yellow,
        ms.home_red,
        ms.away_yellow,
        ms.away_red,
        ms.man_ot_match,
        p.player_id AS motm_player_id,
        up.first_name AS motm_first_name,
        up.last_name AS motm_last_name
      FROM matches m
      JOIN fixtures f ON m.fixture_id = f.fixture_id
      JOIN leagues l ON f.league_id = l.league_id
      JOIN seasons s ON l.season_id = s.season_id
      JOIN teams ht ON f.home_team_id = ht.team_id
      JOIN teams at ON f.away_team_id = at.team_id
      LEFT JOIN venue_fields vf ON f.venue_field_id = vf.field_id
      LEFT JOIN venues v ON vf.venue_id = v.venue_id
      LEFT JOIN match_stats ms ON m.match_id = ms.match_id
      LEFT JOIN players p ON ms.man_ot_match = p.player_id
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE m.match_id = ?
    `;
    
    db.query(query, [matchId], callback);
  },

  // Get match events by match ID
  getMatchEvents: (matchId, callback) => {
    const query = `
      SELECT 
        me.event_id,
        me.match_id,
        me.team_id,
        t.name AS team_name,
        me.player_id,
        up.first_name AS player_first_name,
        up.last_name AS player_last_name,
        me.assist_player_id,
        upa.first_name AS assist_first_name,
        upa.last_name AS assist_last_name,
        me.minute_mark,
        me.event_key,
        et.description AS event_description,
        me.notes,
        me.created_at
      FROM match_events me
      JOIN teams t ON me.team_id = t.team_id
      JOIN event_type et ON me.event_key = et.event_key
      LEFT JOIN players p ON me.player_id = p.player_id
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN players ap ON me.assist_player_id = ap.player_id
      LEFT JOIN users au ON ap.user_id = au.user_id
      LEFT JOIN user_profiles upa ON au.user_id = upa.user_id
      WHERE me.match_id = ?
      ORDER BY me.minute_mark ASC
    `;
    
    db.query(query, [matchId], callback);
  },

  // Get match lineups by match ID
  getMatchLineups: (matchId, callback) => {
    const query = `
      SELECT 
        ml.match_id,
        ml.team_id,
        t.name AS team_name,
        ml.player_id,
        up.first_name,
        up.last_name,
        ml.is_starting,
        ml.shirt_number,
        ml.position_key,
        pp.description AS position_description,
        ml.minutes_played
      FROM match_lineups ml
      JOIN teams t ON ml.team_id = t.team_id
      JOIN players p ON ml.player_id = p.player_id
      JOIN users u ON p.user_id = u.user_id
      JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN player_position pp ON ml.position_key = pp.position_key
      WHERE ml.match_id = ?
      ORDER BY ml.team_id, ml.is_starting DESC, ml.shirt_number ASC
    `;
    
    db.query(query, [matchId], callback);
  },

  // Get player stats by match ID
  getPlayerStatsByMatch: (matchId, callback) => {
    const query = `
      SELECT 
        ml.player_id,
        up.first_name,
        up.last_name,
        t.team_id,
        t.name AS team_name,
        ml.shirt_number,
        ml.position_key,
        pp.description AS position_description,
        ml.minutes_played,
        SUM(CASE WHEN me.event_key IN ('GOAL','PENALTY_GOAL') AND me.player_id = ml.player_id THEN 1 ELSE 0 END) AS goals,
        SUM(CASE WHEN me.event_key = 'ASSIST' AND me.assist_player_id = ml.player_id THEN 1 ELSE 0 END) AS assists,
        SUM(CASE WHEN me.event_key = 'YELLOW_CARD' AND me.player_id = ml.player_id THEN 1 ELSE 0 END) AS yellow_cards,
        SUM(CASE WHEN me.event_key = 'RED_CARD' AND me.player_id = ml.player_id THEN 1 ELSE 0 END) AS red_cards
      FROM match_lineups ml
      JOIN players p ON ml.player_id = p.player_id
      JOIN users u ON p.user_id = u.user_id
      JOIN user_profiles up ON u.user_id = up.user_id
      JOIN teams t ON ml.team_id = t.team_id
      LEFT JOIN player_position pp ON ml.position_key = pp.position_key
      LEFT JOIN match_events me ON me.match_id = ml.match_id AND (me.player_id = ml.player_id OR me.assist_player_id = ml.player_id)
      WHERE ml.match_id = ?
      GROUP BY ml.player_id, up.first_name, up.last_name, t.team_id, t.name, ml.shirt_number, ml.position_key, pp.description, ml.minutes_played
      ORDER BY t.team_id, ml.is_starting DESC, ml.shirt_number ASC
    `;
    
    db.query(query, [matchId], callback);
  },

  // Get team performance by team ID
  getTeamPerformance: (teamId, seasonId = null, callback) => {
    let query = `
      SELECT 
        t.team_id,
        t.name AS team_name,
        l.league_id,
        l.name AS league_name,
        s.season_id,
        s.name AS season_name,
        COUNT(*) AS matches_played,
        SUM(CASE WHEN (f.home_team_id = t.team_id AND m.home_score > m.away_score) OR
                      (f.away_team_id = t.team_id AND m.away_score > m.home_score) THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) AS draws,
        SUM(CASE WHEN (f.home_team_id = t.team_id AND m.home_score < m.away_score) OR
                      (f.away_team_id = t.team_id AND m.away_score < m.home_score) THEN 1 ELSE 0 END) AS losses,
        SUM(CASE WHEN f.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END) AS goals_scored,
        SUM(CASE WHEN f.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END) AS goals_conceded,
        (SUM(CASE WHEN f.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END) - 
         SUM(CASE WHEN f.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END)) AS goal_difference,
        SUM(CASE
              WHEN (f.home_team_id = t.team_id AND m.home_score > m.away_score) OR
                   (f.away_team_id = t.team_id AND m.away_score > m.home_score) THEN 3
              WHEN m.home_score = m.away_score THEN 1
              ELSE 0
            END) AS points
      FROM fixtures f
      JOIN matches m ON m.fixture_id = f.fixture_id AND m.status_key = 'FINAL'
      JOIN teams t ON t.team_id IN (f.home_team_id, f.away_team_id)
      JOIN leagues l ON f.league_id = l.league_id
      JOIN seasons s ON l.season_id = s.season_id
      WHERE t.team_id = ?
    `;
    
    const params = [teamId];
    
    if (seasonId) {
      query += ` AND s.season_id = ?`;
      params.push(seasonId);
    }
    
    query += ` GROUP BY t.team_id, t.name, l.league_id, l.name, s.season_id, s.name
               ORDER BY s.season_id DESC, l.league_id ASC`;
    
    db.query(query, params, callback);
  },

  // Get league standings
  getLeagueStandings: (leagueId, callback) => {
    const query = `
      SELECT 
        t.team_id, 
        t.name AS team_name,
        COUNT(*) AS matches_played,
        SUM(CASE WHEN (f.home_team_id = t.team_id AND m.home_score > m.away_score) OR
                      (f.away_team_id = t.team_id AND m.away_score > m.home_score) THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) AS draws,
        SUM(CASE WHEN (f.home_team_id = t.team_id AND m.home_score < m.away_score) OR
                      (f.away_team_id = t.team_id AND m.away_score < m.home_score) THEN 1 ELSE 0 END) AS losses,
        SUM(CASE WHEN f.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END) AS goals_scored,
        SUM(CASE WHEN f.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END) AS goals_conceded,
        (SUM(CASE WHEN f.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END) - 
         SUM(CASE WHEN f.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END)) AS goal_difference,
        SUM(CASE
              WHEN (f.home_team_id = t.team_id AND m.home_score > m.away_score) OR
                   (f.away_team_id = t.team_id AND m.away_score > m.home_score) THEN 3
              WHEN m.home_score = m.away_score THEN 1
              ELSE 0
            END) AS points
      FROM fixtures f
      JOIN matches m ON m.fixture_id = f.fixture_id AND m.status_key = 'FINAL'
      JOIN teams t ON t.team_id IN (f.home_team_id, f.away_team_id)
      WHERE f.league_id = ?
      GROUP BY t.team_id, t.name
      ORDER BY points DESC, goal_difference DESC, goals_scored DESC, t.name ASC
    `;
    
    db.query(query, [leagueId], callback);
  },

  // Get top performers in a league
  getTopPerformers: (leagueId, statType = 'goals', limit = 10, callback) => {
    const statColumns = {
      'goals': 'SUM(CASE WHEN me.event_key IN (\'GOAL\',\'PENALTY_GOAL\') AND me.player_id = p.player_id THEN 1 ELSE 0 END)',
      'assists': 'SUM(CASE WHEN me.event_key = \'ASSIST\' AND me.assist_player_id = p.player_id THEN 1 ELSE 0 END)',
      'minutes': 'SUM(ml.minutes_played)'
    };
    
    const orderBy = statColumns[statType] || statColumns['goals'];
    
    const query = `
      SELECT 
        p.player_id,
        up.first_name,
        up.last_name,
        t.team_id,
        t.name AS team_name,
        COUNT(DISTINCT m.match_id) AS matches_played,
        SUM(ml.minutes_played) AS total_minutes,
        SUM(CASE WHEN me.event_key IN ('GOAL','PENALTY_GOAL') AND me.player_id = p.player_id THEN 1 ELSE 0 END) AS goals,
        SUM(CASE WHEN me.event_key = 'ASSIST' AND me.assist_player_id = p.player_id THEN 1 ELSE 0 END) AS assists,
        SUM(CASE WHEN me.event_key = 'YELLOW_CARD' AND me.player_id = p.player_id THEN 1 ELSE 0 END) AS yellow_cards,
        SUM(CASE WHEN me.event_key = 'RED_CARD' AND me.player_id = p.player_id THEN 1 ELSE 0 END) AS red_cards
      FROM players p
      JOIN users u ON p.user_id = u.user_id
      JOIN user_profiles up ON u.user_id = up.user_id
      JOIN match_lineups ml ON ml.player_id = p.player_id
      JOIN matches m ON m.match_id = ml.match_id AND m.status_key = 'FINAL'
      JOIN fixtures f ON f.fixture_id = m.fixture_id
      JOIN leagues l ON f.league_id = l.league_id
      JOIN teams t ON ml.team_id = t.team_id
      LEFT JOIN match_events me ON me.match_id = m.match_id AND (me.player_id = p.player_id OR me.assist_player_id = p.player_id)
      WHERE f.league_id = ?
      GROUP BY p.player_id, up.first_name, up.last_name, t.team_id, t.name
      ORDER BY ${orderBy} DESC
      LIMIT ?
    `;
    
    db.query(query, [leagueId, limit], callback);
  }
};

module.exports = MatchStats;
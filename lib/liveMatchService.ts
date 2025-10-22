import { query, withTransaction } from './database'

export interface LiveMatch {
  id: number
  fixtureId?: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINAL' | 'POSTPONED' | 'CANCELLED'
  venue: string
  duration: number
  isAutomatic: boolean
  events: {
    corners: { home: number; away: number }
    yellowCards: { home: number; away: number }
    redCards: { home: number; away: number }
  }
  recentEvents: MatchEvent[]
  homeTeamId?: number
  awayTeamId?: number
  scheduledAt: string
  canStart: boolean
  isLive: boolean
}

export interface MatchEvent {
  id?: number
  matchId: number
  minute: number
  type: string
  team: 'home' | 'away'
  playerId?: number
  playerName?: string
  description?: string
  createdAt?: Date
}

export interface Player {
  id: number
  name: string
  jerseyNumber?: number
  position?: string
}

export interface EventType {
  event_key: string
  description: string
}

// Type definitions for MySQL results
interface QueryResult {
  insertId?: number
  affectedRows?: number
}

// Get fixtures that should be live or can be started
export async function getScheduledFixtures(): Promise<any[]> {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Show matches for next 7 days
  
  console.log('Current time:', now.toISOString());
  console.log('Looking for fixtures between:', now.toISOString(), 'and', sevenDaysFromNow.toISOString());
  
  const sql = `
    SELECT 
      f.fixture_id as fixtureId,
      COALESCE(m.match_id, NULL) as matchId,
      ht.team_id as homeTeamId,
      ht.name as homeTeam,
      at.team_id as awayTeamId,
      at.name as awayTeam,
      COALESCE(m.home_score, 0) as homeScore,
      COALESCE(m.away_score, 0) as awayScore,
      COALESCE(m.status_key, 'SCHEDULED') as status,
      COALESCE(v.name, 'TBD') as venue,
      f.scheduled_at as scheduledAt,
      COALESCE(ms.home_yellow, 0) as yellow_cards_home,
      COALESCE(ms.away_yellow, 0) as yellow_cards_away,
      COALESCE(ms.home_red, 0) as red_cards_home,
      COALESCE(ms.away_red, 0) as red_cards_away,
      0 as corners_home,
      0 as corners_away
    FROM fixtures f
    JOIN teams ht ON f.home_team_id = ht.team_id
    JOIN teams at ON f.away_team_id = at.team_id
    LEFT JOIN matches m ON f.fixture_id = m.fixture_id
    LEFT JOIN venue_fields vf ON f.venue_field_id = vf.field_id
    LEFT JOIN venues v ON vf.venue_id = v.venue_id
    LEFT JOIN match_stats ms ON m.match_id = ms.match_id
    WHERE f.approval_status = 'APPROVED'
      AND f.scheduled_at BETWEEN ? AND ?
      AND (m.status_key IS NULL OR m.status_key IN ('SCHEDULED', 'IN_PROGRESS'))
    ORDER BY f.scheduled_at ASC
  `;
  
  const result = await query(sql, [now.toISOString().slice(0, 19), sevenDaysFromNow.toISOString().slice(0, 19)]) as any[];
  console.log('Found fixtures:', result.length, result);
  return result;
}

// Get all active live matches
export async function getActiveLiveMatches(): Promise<any[]> {
  const sql = `
    SELECT 
      m.match_id as matchId,
      f.fixture_id as fixtureId,
      ht.team_id as homeTeamId,
      ht.name as homeTeam,
      at.team_id as awayTeamId,
      at.name as awayTeam,
      m.home_score as homeScore,
      m.away_score as awayScore,
      0 as minute,
      m.status_key as status,
      COALESCE(v.name, 'TBD') as venue,
      f.scheduled_at as scheduledAt,
      COALESCE(ms.home_yellow, 0) as yellow_cards_home,
      COALESCE(ms.away_yellow, 0) as yellow_cards_away,
      COALESCE(ms.home_red, 0) as red_cards_home,
      COALESCE(ms.away_red, 0) as red_cards_away,
      0 as corners_home,
      0 as corners_away
    FROM matches m
    JOIN fixtures f ON m.fixture_id = f.fixture_id
    JOIN teams ht ON f.home_team_id = ht.team_id
    JOIN teams at ON f.away_team_id = at.team_id
    LEFT JOIN venue_fields vf ON f.venue_field_id = vf.field_id
    LEFT JOIN venues v ON vf.venue_id = v.venue_id
    LEFT JOIN match_stats ms ON m.match_id = ms.match_id
    WHERE m.status_key = 'IN_PROGRESS'
  `;
  
  const result = await query(sql) as any[];
  console.log('Active live matches:', result.length, result);
  return result;
}

// Start a match (convert from SCHEDULED to IN_PROGRESS)
export async function startMatch(fixtureId: number): Promise<number> {
  return await withTransaction(async (connection) => {
    // Check if match already exists
    const existingMatch = await connection.execute(
      'SELECT match_id FROM matches WHERE fixture_id = ?',
      [fixtureId]
    ) as any[]
    
    if (existingMatch.length > 0) {
      // Update existing match to IN_PROGRESS
      await connection.execute(`
        UPDATE matches 
        SET status_key = 'IN_PROGRESS'
        WHERE fixture_id = ?
      `, [fixtureId])
      
      // Ensure match_stats exists
      await connection.execute(`
        INSERT IGNORE INTO match_stats (match_id) 
        VALUES (?)
      `, [existingMatch[0].match_id])
      
      return existingMatch[0].match_id
    } else {
      // Create new match record
      const matchResult = await connection.execute(`
        INSERT INTO matches 
        (fixture_id, status_key, home_score, away_score)
        VALUES (?, 'IN_PROGRESS', 0, 0)
      `, [fixtureId]) as QueryResult
      
      const matchId = matchResult.insertId!
      
      // Create match_stats record
      await connection.execute(`
        INSERT INTO match_stats (match_id) 
        VALUES (?)
      `, [matchId])
      
      return matchId
    }
  })
}

// Get players for a team
export async function getTeamPlayers(teamId: number): Promise<Player[]> {
  const sql = `
    SELECT 
      p.player_id as id,
      CONCAT(up.first_name, ' ', up.last_name) as name,
      tm.squad_number as jerseyNumber,
      p.preferred_position as position
    FROM players p
    JOIN user_profiles up ON p.user_id = up.user_id
    JOIN team_memberships tm ON p.player_id = tm.player_id
    WHERE tm.team_id = ? AND tm.approval_status = 'APPROVED' AND tm.left_at IS NULL
    ORDER BY tm.squad_number
  `
  
  const result = await query(sql, [teamId]) as any[]
  return result as Player[]
}

// Get event types from event_type table
export async function getEventTypes(): Promise<EventType[]> {
  const sql = `
    SELECT event_key, description 
    FROM event_type 
    ORDER BY event_key
  `
  
  const result = await query(sql) as any[]
  return result as EventType[]
}

// Update match score
export async function updateMatchScore(matchId: number, homeScore: number, awayScore: number): Promise<void> {
  await withTransaction(async (connection) => {
    // Update matches table
    await connection.execute(`
      UPDATE matches 
      SET home_score = ?, away_score = ?
      WHERE match_id = ?
    `, [homeScore, awayScore, matchId])
    
    // Update match_stats
    await connection.execute(`
      INSERT INTO match_stats (match_id, home_goals, away_goals) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE home_goals = ?, away_goals = ?
    `, [matchId, homeScore, awayScore, homeScore, awayScore])
  })
}

// Update match status
export async function updateMatchStatus(matchId: number, status: string): Promise<void> {
  const sql = `
    UPDATE matches 
    SET status_key = ?
    WHERE match_id = ?
  `
  
  await query(sql, [status, matchId])
}

// Update match events (cards)
export async function updateMatchEvents(
  matchId: number, 
  eventType: 'corners' | 'yellow_cards' | 'red_cards', 
  homeCount: number, 
  awayCount: number
): Promise<void> {
  // Only yellow and red cards are tracked in match_stats
  if (eventType === 'yellow_cards' || eventType === 'red_cards') {
    const homeField = eventType === 'yellow_cards' ? 'home_yellow' : 'home_red'
    const awayField = eventType === 'yellow_cards' ? 'away_yellow' : 'away_red'
    
    await query(`
      INSERT INTO match_stats (match_id, ${homeField}, ${awayField}) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE ${homeField} = ?, ${awayField} = ?
    `, [matchId, homeCount, awayCount, homeCount, awayCount])
  }
  // Corners are not tracked in current schema
}

// Add match event
export async function addMatchEvent(eventData: MatchEvent): Promise<number> {
  return await withTransaction(async (connection) => {
    // Get team_id based on home/away
    const teamResult = await connection.execute(`
      SELECT 
        CASE 
          WHEN ? = 'home' THEN f.home_team_id 
          ELSE f.away_team_id 
        END as team_id
      FROM matches m
      JOIN fixtures f ON m.fixture_id = f.fixture_id
      WHERE m.match_id = ?
    `, [eventData.team, eventData.matchId]) as any[]
    
    if (teamResult.length === 0) {
      throw new Error('Match not found')
    }
    
    const teamId = teamResult[0].team_id
    
    // Insert match event
    const eventResult = await connection.execute(`
      INSERT INTO match_events 
      (match_id, team_id, player_id, minute_mark, event_key, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      eventData.matchId,
      teamId,
      eventData.playerId || null,
      eventData.minute,
      eventData.type,
      eventData.description || null
    ]) as QueryResult
    
    return eventResult.insertId!
  })
}

// Get recent events for a match
export async function getMatchRecentEvents(matchId: number, limit: number = 10): Promise<MatchEvent[]> {
  const sql = `
    SELECT 
      me.event_id as id,
      me.match_id as matchId,
      me.minute_mark as minute,
      me.event_key as type,
      CASE 
        WHEN me.team_id = f.home_team_id THEN 'home'
        ELSE 'away'
      END as team,
      me.player_id as playerId,
      CONCAT(up.first_name, ' ', up.last_name) as playerName,
      me.notes as description,
      me.created_at as createdAt
    FROM match_events me
    JOIN matches m ON me.match_id = m.match_id
    JOIN fixtures f ON m.fixture_id = f.fixture_id
    LEFT JOIN players p ON me.player_id = p.player_id
    LEFT JOIN user_profiles up ON p.user_id = up.user_id
    WHERE me.match_id = ?
    ORDER BY me.minute_mark DESC, me.created_at DESC
    LIMIT ?
  `
  
  const result = await query(sql, [matchId, limit]) as any[]
  return result as MatchEvent[]
}

// End a match
export async function endMatch(matchId: number): Promise<void> {
  const sql = `
    UPDATE matches 
    SET status_key = 'FINAL'
    WHERE match_id = ?
  `
  
  await query(sql, [matchId])
}

// Reset match data
export async function resetMatch(matchId: number): Promise<void> {
  await withTransaction(async (connection) => {
    // Reset match scores
    await connection.execute(`
      UPDATE matches 
      SET home_score = 0, away_score = 0
      WHERE match_id = ?
    `, [matchId])
    
    // Reset match stats
    await connection.execute(`
      UPDATE match_stats 
      SET home_goals = 0, away_goals = 0, home_yellow = 0, away_yellow = 0, home_red = 0, away_red = 0
      WHERE match_id = ?
    `, [matchId])
    
    // Clear match events
    await connection.execute('DELETE FROM match_events WHERE match_id = ?', [matchId])
  })
}

// Start a manual match (create a fixture and match for non-scheduled games)
export async function startManualMatch(matchData: {
  homeTeam: string
  awayTeam: string
  venue: string
}): Promise<number> {
  return await withTransaction(async (connection) => {
    // For manual matches, we need to create a minimal fixture first
    // This is a simplified implementation - you might want to use actual team IDs
    const fixtureResult = await connection.execute(`
      INSERT INTO fixtures 
      (league_id, home_team_id, away_team_id, scheduled_at, created_by, approval_status)
      VALUES (1, 1, 2, NOW(), 1, 'APPROVED')
    `) as QueryResult
    
    const fixtureId = fixtureResult.insertId!
    
    // Create the match record
    const matchResult = await connection.execute(`
      INSERT INTO matches 
      (fixture_id, status_key, home_score, away_score)
      VALUES (?, 'IN_PROGRESS', 0, 0)
    `, [fixtureId]) as QueryResult
    
    const matchId = matchResult.insertId!
    
    // Create match_stats record
    await connection.execute(`
      INSERT INTO match_stats (match_id) 
      VALUES (?)
    `, [matchId])
    
    return matchId
  })
}
import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateString = sevenDaysAgo.toISOString().split('T')[0];

    // Get teams that scored the most goals in the past 7 days
    const topTeamsSql = `
      SELECT 
        t.team_id,
        t.name AS team_name,
        SUM(
          CASE 
            WHEN f.home_team_id = t.team_id THEN m.home_score
            WHEN f.away_team_id = t.team_id THEN m.away_score
            ELSE 0
          END
        ) AS total_goals,
        COUNT(DISTINCT f.fixture_id) AS matches_played
      FROM teams t
      LEFT JOIN fixtures f ON (f.home_team_id = t.team_id OR f.away_team_id = t.team_id)
        AND f.scheduled_at >= '${dateString}'
        AND f.approval_status = 'APPROVED'
      LEFT JOIN matches m ON m.fixture_id = f.fixture_id 
        AND m.status_key = 'FINAL'
      GROUP BY t.team_id, t.name
      HAVING total_goals > 0
      ORDER BY total_goals DESC, matches_played DESC
      LIMIT 1
    `

    const topTeams = await query(topTeamsSql, []) as any[]

    if (topTeams.length === 0) {
      return NextResponse.json({
        success: true,
        teamOfTheWeek: null,
        message: 'No matches played in the past 7 days'
      })
    }

    const teamOfTheWeek = topTeams[0];

    // Get top performing players from the team of the week in the past 7 days
    const topPlayersSql = `
      SELECT 
        p.player_id,
        up.first_name,
        up.last_name,
        t.name AS team_name,
        COALESCE(pp.position_key, 'PLAYER') AS position_key,
        COUNT(me.event_id) AS events_count,
        SUM(CASE WHEN me.event_key IN ('GOAL', 'PENALTY_GOAL') THEN 1 ELSE 0 END) AS goals,
        SUM(CASE WHEN me.event_key = 'ASSIST' THEN 1 ELSE 0 END) AS assists,
        ROUND(
          (COUNT(me.event_id) * 0.5 + 
           SUM(CASE WHEN me.event_key IN ('GOAL', 'PENALTY_GOAL') THEN 3 ELSE 0 END) +
           SUM(CASE WHEN me.event_key = 'ASSIST' THEN 2 ELSE 0 END) -
           SUM(CASE WHEN me.event_key IN ('YELLOW_CARD', 'RED_CARD') THEN 1 ELSE 0 END)
          ) / GREATEST(COUNT(DISTINCT m.match_id), 1), 
          1
        ) AS rating
      FROM players p
      JOIN user_profiles up ON up.user_id = p.user_id
      JOIN team_memberships tm ON tm.player_id = p.player_id AND tm.left_at IS NULL
      JOIN teams t ON t.team_id = tm.team_id
      LEFT JOIN match_lineups ml ON ml.player_id = p.player_id
      LEFT JOIN matches m ON m.match_id = ml.match_id AND m.status_key = 'FINAL'
      LEFT JOIN fixtures f ON f.fixture_id = m.fixture_id 
        AND f.scheduled_at >= '${dateString}'
        AND f.approval_status = 'APPROVED'
      LEFT JOIN match_events me ON me.match_id = m.match_id AND me.player_id = p.player_id
      LEFT JOIN player_position pp ON pp.position_key = p.preferred_position
      WHERE t.team_id = ${teamOfTheWeek.team_id}
      GROUP BY p.player_id, up.first_name, up.last_name, t.name, pp.position_key
      HAVING events_count > 0
      ORDER BY rating DESC, goals DESC, assists DESC
      LIMIT 11
    `

    const topPlayers = await query(topPlayersSql, []) as any[]

    // If we don't have enough players with events, get random players from the team
    let players = topPlayers;
    if (players.length < 11) {
      const neededPlayers = 11 - players.length;
      
      // Build the NOT IN clause manually
      const playerIds = players.map((p: any) => p.player_id);
      let notInClause = '';
      if (playerIds.length > 0) {
        notInClause = `AND p.player_id NOT IN (${playerIds.join(',')})`;
      }

      const additionalPlayersSql = `
        SELECT 
          p.player_id,
          up.first_name,
          up.last_name,
          t.name AS team_name,
          COALESCE(pp.position_key, 'PLAYER') AS position_key,
          7.0 AS rating
        FROM players p
        JOIN user_profiles up ON up.user_id = p.user_id
        JOIN team_memberships tm ON tm.player_id = p.player_id AND tm.left_at IS NULL
        JOIN teams t ON t.team_id = tm.team_id
        LEFT JOIN player_position pp ON pp.position_key = p.preferred_position
        WHERE t.team_id = ${teamOfTheWeek.team_id}
          ${notInClause}
        ORDER BY RAND()
        LIMIT ${neededPlayers}
      `

      const additionalPlayers = await query(additionalPlayersSql, []) as any[]
      players = [...players, ...additionalPlayers];
    }

    // Get coach of the team
    const coachSql = `
      SELECT 
        c.coach_id,
        up.first_name,
        up.last_name,
        t.name AS team_name
      FROM coaches c
      JOIN users u ON u.user_id = c.user_id
      JOIN user_profiles up ON up.user_id = u.user_id
      JOIN teams t ON t.coach_id = c.coach_id
      WHERE t.team_id = ${teamOfTheWeek.team_id}
    `

    const coachResult = await query(coachSql, []) as any[]

    const coach = coachResult[0] ? {
      name: `${coachResult[0].first_name} ${coachResult[0].last_name}`,
      team: coachResult[0].team_name,
      reason: `Led ${teamOfTheWeek.team_name} to score ${teamOfTheWeek.total_goals} goals in ${teamOfTheWeek.matches_played} matches`
    } : {
      name: 'Coach Not Assigned',
      team: teamOfTheWeek.team_name,
      reason: `Team scored ${teamOfTheWeek.total_goals} goals in ${teamOfTheWeek.matches_played} matches`
    }

    return NextResponse.json({
      success: true,
      teamOfTheWeek: {
        week: Math.floor((new Date().getTime() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
        team: teamOfTheWeek,
        players: players.slice(0, 11), // Ensure we only return 11 players
        coach: coach
      }
    })
  } catch (error) {
    console.error('Error fetching team of the week:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team of the week' },
      { status: 500 }
    )
  }
}
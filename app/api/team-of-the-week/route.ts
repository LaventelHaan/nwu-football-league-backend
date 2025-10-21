import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    // Get players
    const players = await query(`
      SELECT 
        p.player_id,
        up.first_name,
        up.last_name,
        t.name AS team_name,
        pp.position_key,
        ROUND(RAND() * 5 + 5, 1) as rating
      FROM players p
      JOIN user_profiles up ON up.user_id = p.user_id
      JOIN team_memberships tm ON tm.player_id = p.player_id AND tm.left_at IS NULL
      JOIN teams t ON t.team_id = tm.team_id
      LEFT JOIN player_position pp ON pp.position_key = p.preferred_position
      ORDER BY RAND()
      LIMIT 11
    `) as any[]

    // Get coach of the week separately
    const coachResult = await query(`
      SELECT 
        c.coach_id,
        up.first_name,
        up.last_name,
        t.name AS team_name,
        'Exceptional leadership and strategy' AS reason
      FROM coaches c
      JOIN users u ON u.user_id = c.user_id
      JOIN user_profiles up ON up.user_id = u.user_id
      JOIN teams t ON t.coach_id = c.coach_id
      ORDER BY RAND()
      LIMIT 1
    `) as any[]

    const coach = coachResult[0] ? {
      name: `${coachResult[0].first_name} ${coachResult[0].last_name}`,
      team: coachResult[0].team_name,
      reason: coachResult[0].reason
    } : {
      name: 'No Coach Selected',
      team: '',
      reason: 'No coach was selected for this week'
    }

    return NextResponse.json({
      success: true,
      teamOfTheWeek: {
        week: Math.floor((new Date().getTime() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
        players: players,
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
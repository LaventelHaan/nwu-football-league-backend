import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('league_id') || '1' // Default to league 1
    const limit = searchParams.get('limit') || '10'

    const topScorers = await query(`
      SELECT 
        p.player_id,
        up.first_name,
        up.last_name,
        t.name AS team_name,
        ps.goals
      FROM player_stats ps
      JOIN players p ON p.player_id = ps.player_id
      JOIN user_profiles up ON up.user_id = p.user_id
      JOIN team_memberships tm ON tm.player_id = p.player_id AND tm.left_at IS NULL
      JOIN teams t ON t.team_id = tm.team_id
      WHERE ps.league_id = ?
        AND ps.goals > 0
      ORDER BY ps.goals DESC, up.first_name ASC
      LIMIT ${parseInt(limit)}
    `, [parseInt(leagueId)]) as any[]

    return NextResponse.json({
      success: true,
      topScorers
    })
  } catch (error) {
    console.error('Error fetching top scorers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top scorers' },
      { status: 500 }
    )
  }
}
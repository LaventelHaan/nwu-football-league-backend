import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const standings = await query(`
      SELECT 
        t.team_id,
        t.name AS team_name,
        ts.points,
        ts.wins,
        ts.draws,
        ts.losses,
        ts.goals_scored,
        ts.goals_conceded
      FROM team_stats ts
      JOIN teams t ON t.team_id = ts.team_id
      WHERE ts.league_id = 1  -- Replace with current league ID
      ORDER BY ts.points DESC, (ts.goals_scored - ts.goals_conceded) DESC
    `) as any[]

    return NextResponse.json({
      success: true,
      standings: standings.map((team, index) => ({
        ...team,
        position: index + 1
      }))
    })
  } catch (error) {
    console.error('Error fetching standings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}
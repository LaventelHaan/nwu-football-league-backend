import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    const leagueId = searchParams.get('league_id')

    let sql = `
      SELECT 
        f.fixture_id,
        f.home_team_id,
        f.away_team_id,
        f.scheduled_at,
        f.venue_field_id,
        ht.name AS home_team_name,
        at.name AS away_team_name,
        v.name AS venue_name,
        vf.name AS field_name,
        m.home_score,
        m.away_score,
        m.status_key
      FROM fixtures f
      JOIN teams ht ON ht.team_id = f.home_team_id
      JOIN teams at ON at.team_id = f.away_team_id
      LEFT JOIN venue_fields vf ON vf.field_id = f.venue_field_id
      LEFT JOIN venues v ON v.venue_id = vf.venue_id
      LEFT JOIN matches m ON m.fixture_id = f.fixture_id
      WHERE f.scheduled_at > NOW()
        AND f.approval_status = 'APPROVED'
    `
    
    const params: any[] = []

    if (leagueId) {
      sql += ` AND f.league_id = ?`
      params.push(parseInt(leagueId))
    }

    sql += ` ORDER BY f.scheduled_at ASC LIMIT ${parseInt(limit)}`

    // Use direct query format to avoid prepared statement issues with LIMIT
    const fixtures = await query(sql, params) as any[]

    return NextResponse.json({
      success: true,
      fixtures
    })
  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upcoming fixtures' },
      { status: 500 }
    )
  }
}
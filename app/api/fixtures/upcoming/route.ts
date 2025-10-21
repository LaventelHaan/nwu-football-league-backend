import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const fixtures = await query(`
      SELECT 
        f.fixture_id,
        f.league_id,
        f.home_team_id,
        f.away_team_id,
        f.scheduled_at,
        f.venue_field_id,
        ht.name AS home_team_name,
        at.name AS away_team_name,
        v.name AS venue_name,
        vf.name AS field_name,
        l.name AS league_name,
        m.home_score,
        m.away_score,
        m.status_key
      FROM fixtures f
      JOIN teams ht ON ht.team_id = f.home_team_id
      JOIN teams at ON at.team_id = f.away_team_id
      JOIN leagues l ON l.league_id = f.league_id
      LEFT JOIN venue_fields vf ON vf.field_id = f.venue_field_id
      LEFT JOIN venues v ON v.venue_id = vf.venue_id
      LEFT JOIN matches m ON m.fixture_id = f.fixture_id
      WHERE f.approval_status = 'APPROVED'
        AND f.scheduled_at >= NOW()
        AND (m.status_key IS NULL OR m.status_key IN ('SCHEDULED', 'IN_PROGRESS'))
      ORDER BY f.scheduled_at ASC
      LIMIT 20
    `) as any[]

    return NextResponse.json({
      success: true,
      fixtures: fixtures.map(f => ({
        ...f,
        scheduled_at: new Date(f.scheduled_at).toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching fixtures:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fixtures' },
      { status: 500 }
    )
  }
}
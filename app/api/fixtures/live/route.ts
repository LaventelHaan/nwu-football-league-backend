import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: 'Start and end parameters are required' },
        { status: 400 }
      )
    }

    const matches = await query(`
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
      WHERE f.scheduled_at BETWEEN ? AND ?
        AND f.approval_status = 'APPROVED'
        AND (m.status_key = 'SCHEDULED' OR m.status_key = 'IN_PROGRESS' OR m.status_key = 'FINAL')
      ORDER BY f.scheduled_at ASC
    `, [start, end]) as any[]

    return NextResponse.json({
      success: true,
      matches
    })
  } catch (error) {
    console.error('Error fetching live matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live matches' },
      { status: 500 }
    )
  }
}
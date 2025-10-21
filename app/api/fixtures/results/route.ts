import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'

    const results = await query(`
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
        m.match_id,
        m.status_key,
        m.home_score,
        m.away_score,
        m.started_at,
        m.ended_at
      FROM fixtures f
      JOIN teams ht ON ht.team_id = f.home_team_id
      JOIN teams at ON at.team_id = f.away_team_id
      JOIN leagues l ON l.league_id = f.league_id
      JOIN matches m ON m.fixture_id = f.fixture_id
      LEFT JOIN venue_fields vf ON vf.field_id = f.venue_field_id
      LEFT JOIN venues v ON v.venue_id = vf.venue_id
      WHERE f.approval_status = 'APPROVED'
        AND m.status_key = 'FINAL'
      ORDER BY f.scheduled_at DESC
      LIMIT ?
    `, [parseInt(limit)]) as any[]

    return NextResponse.json({
      success: true,
      results: results.map(r => ({
        ...r,
        scheduled_at: new Date(r.scheduled_at).toISOString(),
        started_at: r.started_at ? new Date(r.started_at).toISOString() : null,
        ended_at: r.ended_at ? new Date(r.ended_at).toISOString() : null
      }))
    })
  } catch (error) {
    console.error('Error fetching recent results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent results' },
      { status: 500 }
    )
  }
}
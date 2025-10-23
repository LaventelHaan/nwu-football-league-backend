import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface FixtureRow {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  date: string
  time: string
  venue: string
  status: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    const fixtures = await query(
      `SELECT 
        f.fixture_id as id,
        ht.name as homeTeam,
        at.name as awayTeam,
        l.name as league,
        DATE_FORMAT(f.scheduled_at, '%Y-%m-%d') as date,
        DATE_FORMAT(f.scheduled_at, '%H:%i') as time,
        v.name as venue,
        m.status_key as status
       FROM fixtures f
       JOIN teams ht ON ht.team_id = f.home_team_id
       JOIN teams at ON at.team_id = f.away_team_id
       JOIN leagues l ON l.league_id = f.league_id
       LEFT JOIN matches m ON m.fixture_id = f.fixture_id
       LEFT JOIN venue_fields vf ON vf.field_id = f.venue_field_id
       LEFT JOIN venues v ON v.venue_id = vf.venue_id
       WHERE f.approval_status = 'APPROVED'
       AND (f.home_team_id = ? OR f.away_team_id = ?)
       AND f.scheduled_at >= NOW()
       ORDER BY f.scheduled_at ASC
       LIMIT 10`,
      [parseInt(teamId), parseInt(teamId)]
    ) as FixtureRow[]

    return NextResponse.json(Array.isArray(fixtures) ? fixtures : [])

  } catch (error) {
    console.error('Error fetching fixtures:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET /api/admin/fixtures - Get all fixtures with filters
export async function GET(request: Request) {
  try {
    console.log('Fetching fixtures...')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const leagueId = searchParams.get('leagueId')

    console.log('Query params:', { status, leagueId })

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (status && status !== 'ALL') {
      whereClause += ' AND f.approval_status = ?'
      params.push(status)
    }

    if (leagueId && leagueId !== 'ALL') {
      whereClause += ' AND f.league_id = ?'
      params.push(parseInt(leagueId))
    }

    console.log('Executing query with:', { whereClause, params })

    const fixtures = await query(`
      SELECT 
        f.fixture_id as id,
        f.scheduled_at,
        f.approval_status as status,
        ht.team_id as home_team_id,
        ht.name as home_team,
        at.team_id as away_team_id,
        at.name as away_team,
        l.league_id,
        l.name as league,
        vf.field_id as venue_field_id,
        vf.name as field_name,
        v.name as venue_name,
        v.venue_id,
        m.match_id,
        m.home_score,
        m.away_score,
        m.status_key as match_status,
        m.started_at,
        m.ended_at,
        u.user_id as created_by_id,
        up.first_name as creator_first_name,
        up.last_name as creator_last_name
        -- removed f.created_at and f.notes as they don't exist in schema
      FROM fixtures f
      JOIN teams ht ON f.home_team_id = ht.team_id
      JOIN teams at ON f.away_team_id = at.team_id
      JOIN leagues l ON f.league_id = l.league_id
      LEFT JOIN venue_fields vf ON f.venue_field_id = vf.field_id
      LEFT JOIN venues v ON vf.venue_id = v.venue_id
      LEFT JOIN matches m ON f.fixture_id = m.fixture_id
      LEFT JOIN users u ON f.created_by = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      ${whereClause}
      ORDER BY f.scheduled_at DESC
    `, params) as any[]

    console.log('Raw fixtures from DB:', fixtures)

    const formattedFixtures = fixtures.map(fixture => {
      const scheduledDate = new Date(fixture.scheduled_at)
      const venue = fixture.venue_name ? 
        `${fixture.venue_name} - ${fixture.field_name}` : 
        (fixture.field_name || 'TBD')

      return {
        id: fixture.id,
        homeTeam: fixture.home_team,
        awayTeam: fixture.away_team,
        league: fixture.league,
        date: scheduledDate.toISOString().split('T')[0],
        time: scheduledDate.toTimeString().slice(0, 5),
        venue: venue,
        status: fixture.status.toLowerCase(),
        homeScore: fixture.home_score || 0,
        awayScore: fixture.away_score || 0,
        matchStatus: fixture.match_status,
        createdBy: fixture.creator_first_name && fixture.creator_last_name ? 
          `${fixture.creator_first_name} ${fixture.creator_last_name}` : 'System',
        submittedDate: scheduledDate.toISOString().split('T')[0], // Use scheduled date as submitted date
        scheduledAt: fixture.scheduled_at,
        homeTeamId: fixture.home_team_id,
        awayTeamId: fixture.away_team_id,
        leagueId: fixture.league_id,
        venueFieldId: fixture.venue_field_id,
        matchId: fixture.match_id
        // removed notes as it doesn't exist in schema
      }
    })

    console.log('Formatted fixtures:', formattedFixtures)

    return NextResponse.json({
      success: true,
      fixtures: formattedFixtures
    })
  } catch (error: any) {
    console.error('Error fetching fixtures:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      fixtures: [] // Return empty array on error
    }, { status: 500 })
  }
}

// POST /api/admin/fixtures - Create new fixture
export async function POST(request: Request) {
  try {
    const {
      homeTeamId,
      awayTeamId,
      leagueId,
      scheduledAt,
      venueFieldId
      // removed notes as it doesn't exist in schema
    } = await request.json()

    console.log('Creating fixture with:', { homeTeamId, awayTeamId, leagueId, scheduledAt, venueFieldId })

    // Validate required fields
    if (!homeTeamId || !awayTeamId || !leagueId || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: homeTeamId, awayTeamId, leagueId, and scheduledAt are required' },
        { status: 400 }
      )
    }

    // Check if teams are different
    if (homeTeamId === awayTeamId) {
      return NextResponse.json(
        { success: false, error: 'Home and away teams cannot be the same' },
        { status: 400 }
      )
    }

    // For now, use a mock user ID - you'll want to get this from the session
    const createdBy = 1 // Replace with actual user ID from auth

    const result = await query(`
      INSERT INTO fixtures (
        league_id, 
        home_team_id, 
        away_team_id, 
        scheduled_at, 
        venue_field_id,
        created_by,
        approval_status
        -- removed notes as it doesn't exist in schema
      ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
    `, [leagueId, homeTeamId, awayTeamId, scheduledAt, venueFieldId || null, createdBy]) as any

    console.log('Fixture created with ID:', result.insertId)

    return NextResponse.json({
      success: true,
      message: 'Fixture created successfully',
      fixtureId: result.insertId
    })
  } catch (error: any) {
    console.error('Error creating fixture:', error)
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'A fixture already exists for this time slot' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create fixture' },
      { status: 500 }
    )
  }
}
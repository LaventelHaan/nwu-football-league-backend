import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

// PATCH /api/admin/fixtures/[id] - Update fixture status (approve/reject)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fixtureId = id
    
    const { action, notes } = await request.json()

    console.log('Updating fixture status:', { fixtureId, action, notes })

    if (!action || (action === 'reject' && !notes)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED'
    
    // For now, use mock user ID - replace with actual user ID from auth
    const approvedById = 1

    await query(`
      UPDATE fixtures 
      SET approval_status = ?, approved_by = ?, approved_at = NOW()
      WHERE fixture_id = ?
    `, [status, approvedById, fixtureId])

    return NextResponse.json({
      success: true,
      message: `Fixture ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    })
  } catch (error: any) {
    console.error('Error updating fixture:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update fixture' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/fixtures/[id] - Update match results
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fixtureId = id
    
    const {
      homeScore,
      awayScore,
      matchStatus,
      startedAt,
      endedAt
    } = await request.json()

    console.log('Updating match results:', { fixtureId, homeScore, awayScore, matchStatus })

    // Convert ISO dates to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    const formatDateForMySQL = (isoDate: string) => {
      if (!isoDate) return null
      const date = new Date(isoDate)
      return date.toISOString().slice(0, 19).replace('T', ' ')
    }

    const mysqlStartedAt = startedAt ? formatDateForMySQL(startedAt) : null
    const mysqlEndedAt = endedAt ? formatDateForMySQL(endedAt) : null

    console.log('Formatted dates for MySQL:', { mysqlStartedAt, mysqlEndedAt })

    await query('START TRANSACTION')

    try {
      // Check if match exists
      const existingMatch = await query(
        'SELECT match_id FROM matches WHERE fixture_id = ?',
        [fixtureId]
      ) as any[]

      if (existingMatch.length > 0) {
        // Update existing match
        await query(`
          UPDATE matches 
          SET home_score = ?, away_score = ?, status_key = ?, started_at = ?, ended_at = ?
          WHERE fixture_id = ?
        `, [homeScore, awayScore, matchStatus, mysqlStartedAt, mysqlEndedAt, fixtureId])
      } else {
        // Create new match
        await query(`
          INSERT INTO matches (fixture_id, home_score, away_score, status_key, started_at, ended_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [fixtureId, homeScore, awayScore, matchStatus, mysqlStartedAt, mysqlEndedAt])
      }

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Match results updated successfully'
      })
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  } catch (error: any) {
    console.error('Error updating match results:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update match results' },
      { status: 500 }
    )
  }
}

// GET /api/admin/fixtures/[id] - Get specific fixture (if needed)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fixtureId = id

    const fixtureResult = await query(`
      SELECT 
        f.fixture_id as id,
        f.scheduled_at,
        f.approval_status as status,
        ht.name as home_team,
        at.name as away_team,
        l.name as league,
        vf.name as field_name,
        v.name as venue_name,
        m.match_id,
        m.home_score,
        m.away_score,
        m.status_key as match_status
      FROM fixtures f
      JOIN teams ht ON f.home_team_id = ht.team_id
      JOIN teams at ON f.away_team_id = at.team_id
      JOIN leagues l ON f.league_id = l.league_id
      LEFT JOIN venue_fields vf ON f.venue_field_id = vf.field_id
      LEFT JOIN venues v ON vf.venue_id = v.venue_id
      LEFT JOIN matches m ON f.fixture_id = m.fixture_id
      WHERE f.fixture_id = ?
    `, [fixtureId]) as any[]

    if (fixtureResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Fixture not found' },
        { status: 404 }
      )
    }

    const fixture = fixtureResult[0]
    const scheduledDate = new Date(fixture.scheduled_at)

    const formattedFixture = {
      id: fixture.id,
      homeTeam: fixture.home_team,
      awayTeam: fixture.away_team,
      league: fixture.league,
      date: scheduledDate.toISOString().split('T')[0],
      time: scheduledDate.toTimeString().slice(0, 5),
      venue: fixture.venue_name ? `${fixture.venue_name} - ${fixture.field_name}` : (fixture.field_name || 'TBD'),
      status: fixture.status.toLowerCase(),
      homeScore: fixture.home_score || 0,
      awayScore: fixture.away_score || 0,
      matchStatus: fixture.match_status
    }

    return NextResponse.json({
      success: true,
      fixture: formattedFixture
    })
  } catch (error: any) {
    console.error('Error fetching fixture:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch fixture' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

// GET /api/admin/fixtures/data - Get teams, leagues, and venues for dropdowns
export async function GET() {
  try {
    console.log('Fetching fixture dropdown data...')

    // Get teams
    const teams = await query(`
      SELECT team_id as id, name, short_code 
      FROM teams 
      WHERE approval_status = 'APPROVED'
      ORDER BY name
    `) as any[]

    // Get ALL leagues (not just current ones)
    const leagues = await query(`
      SELECT l.league_id as id, l.name, s.name as season_name, s.start_date, s.end_date
      FROM leagues l
      JOIN seasons s ON l.season_id = s.season_id
      ORDER BY s.start_date DESC, l.name
    `) as any[]

    // Get venues and fields
    const venues = await query(`
      SELECT vf.field_id as id, vf.name as field_name, v.name as venue_name, v.venue_id
      FROM venue_fields vf
      JOIN venues v ON vf.venue_id = v.venue_id
      WHERE vf.is_active = TRUE AND v.is_active = TRUE
      ORDER BY v.name, vf.name
    `) as any[]

    console.log('Dropdown data:', {
      teams: teams.length,
      leagues: leagues.length,
      venues: venues.length
    })

    const responseData = {
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        shortCode: team.short_code
      })),
      leagues: leagues.map(league => ({
        id: league.id,
        name: league.name,
        season: league.season_name,
        startDate: league.start_date,
        endDate: league.end_date
      })),
      venues: venues.map(venue => ({
        id: venue.id,
        name: `${venue.venue_name} - ${venue.field_name}`,
        venueName: venue.venue_name,
        fieldName: venue.field_name,
        venueId: venue.venue_id
      }))
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })
  } catch (error: any) {
    console.error('Error fetching fixture data:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      data: {
        teams: [],
        leagues: [],
        venues: []
      }
    }, { status: 500 })
  }
}
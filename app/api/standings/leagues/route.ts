import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('season_id')

    if (!seasonId) {
      return NextResponse.json(
        { success: false, error: 'Season ID is required' },
        { status: 400 }
      )
    }

    const leagues = await query(`
      SELECT 
        l.league_id,
        l.name,
        l.season_id
      FROM leagues l
      WHERE l.season_id = ?
      ORDER BY l.name ASC
    `, [seasonId]) as any[]

    return NextResponse.json({
      success: true,
      leagues
    })
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leagues' },
      { status: 500 }
    )
  }
}
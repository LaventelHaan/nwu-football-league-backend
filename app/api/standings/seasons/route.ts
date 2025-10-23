import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const seasons = await query(`
      SELECT 
        season_id,
        name,
        start_date,
        end_date
      FROM seasons 
      ORDER BY start_date DESC
    `) as any[]

    return NextResponse.json({
      success: true,
      seasons
    })
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}
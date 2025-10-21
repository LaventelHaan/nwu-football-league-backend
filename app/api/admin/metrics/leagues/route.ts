import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const result = await query(`
      SELECT COUNT(DISTINCT league_id) as count
      FROM leagues 
      JOIN seasons ON seasons.season_id = leagues.season_id
      WHERE seasons.end_date >= CURDATE()
    `) as any[]

    return NextResponse.json({
      success: true,
      count: result[0]?.count || 0
    })
  } catch (error) {
    console.error('Error fetching active leagues:', error)
    return NextResponse.json(
      { success: false, count: 0 },
      { status: 500 }
    )
  }
}
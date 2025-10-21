import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const [totalGoals, totalMatches] = await Promise.all([
      query(`SELECT SUM(home_score + away_score) as total FROM matches WHERE status_key = 'FINAL'`),
      query(`SELECT COUNT(*) as count FROM matches WHERE status_key = 'FINAL'`)
    ]) as any[]

    const total = totalGoals[0]?.total || 0
    const matchCount = totalMatches[0]?.count || 1 // Avoid division by zero
    const average = total / matchCount

    return NextResponse.json({
      success: true,
      total: total,
      average: average
    })
  } catch (error) {
    console.error('Error fetching goals data:', error)
    return NextResponse.json(
      { success: false, total: 0, average: 0 },
      { status: 500 }
    )
  }
}
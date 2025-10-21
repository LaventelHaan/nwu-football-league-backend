import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    // This week's upcoming matches
    const thisWeekResult = await query(`
      SELECT COUNT(*) as count
      FROM fixtures f
      LEFT JOIN matches m ON m.fixture_id = f.fixture_id
      WHERE f.approval_status = 'APPROVED'
        AND YEARWEEK(f.scheduled_at, 1) = YEARWEEK(CURDATE(), 1)
        AND (m.status_key IS NULL OR m.status_key IN ('SCHEDULED', 'IN_PROGRESS'))
    `) as any[]

    // Last week's completed matches
    const lastWeekResult = await query(`
      SELECT COUNT(*) as count
      FROM fixtures f
      JOIN matches m ON m.fixture_id = f.fixture_id
      WHERE f.approval_status = 'APPROVED'
        AND YEARWEEK(f.scheduled_at, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)
        AND m.status_key = 'FINAL'
    `) as any[]

    // Average goals per match - ensure it returns a number
    const avgGoalsResult = await query(`
      SELECT 
        COALESCE(CAST(AVG(m.home_score + m.away_score) AS DECIMAL(10,2)), 0) as avg_goals
      FROM matches m
      JOIN fixtures f ON f.fixture_id = m.fixture_id
      WHERE f.approval_status = 'APPROVED'
        AND m.status_key = 'FINAL'
        AND m.home_score IS NOT NULL
        AND m.away_score IS NOT NULL
    `) as any[]

    // Ensure all values are numbers
    const stats = {
      thisWeek: Number(thisWeekResult[0]?.count) || 0,
      lastWeek: Number(lastWeekResult[0]?.count) || 0,
      avgGoals: Number(avgGoalsResult[0]?.avg_goals) || 0
    }

    return NextResponse.json({
      success: true,
      stats: stats
    })
  } catch (error) {
    console.error('Error fetching fixtures stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fixtures stats' },
      { status: 500 }
    )
  }
}
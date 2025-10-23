import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface CalculatedStatsRow {
  matches_played: number
  goals: number
  assists: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    console.log('Calculating stats for player ID:', playerId)

    // Calculate stats from match events and lineups
    const calculatedStats = await query(
      `SELECT 
        -- Count distinct matches where player was in lineup
        COUNT(DISTINCT ml.match_id) as matches_played,
        
        -- Count goals
        SUM(CASE WHEN me.event_key IN ('GOAL', 'PENALTY_GOAL') AND me.player_id = ? THEN 1 ELSE 0 END) as goals,
        
        -- Count assists  
        SUM(CASE WHEN me.event_key = 'ASSIST' AND me.assist_player_id = ? THEN 1 ELSE 0 END) as assists
        
       FROM match_lineups ml
       LEFT JOIN matches m ON m.match_id = ml.match_id
       LEFT JOIN match_events me ON me.match_id = ml.match_id
       WHERE ml.player_id = ? AND m.status_key = 'FINAL'`,
      [parseInt(playerId), parseInt(playerId), parseInt(playerId)]
    ) as CalculatedStatsRow[]

    console.log('Calculated stats:', calculatedStats)

    let performance = 0
    if (Array.isArray(calculatedStats) && calculatedStats.length > 0) {
      const stats = calculatedStats[0]
      const goalContribution = (stats.goals + stats.assists) * 15
      performance = Math.min(goalContribution, 100)
    }

    const responseData = {
      matchesPlayed: Array.isArray(calculatedStats) && calculatedStats.length > 0 ? calculatedStats[0].matches_played : 0,
      goals: Array.isArray(calculatedStats) && calculatedStats.length > 0 ? calculatedStats[0].goals : 0,
      assists: Array.isArray(calculatedStats) && calculatedStats.length > 0 ? calculatedStats[0].assists : 0,
      performance: Math.round(performance)
    }

    console.log('Calculated response data:', responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error calculating player stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
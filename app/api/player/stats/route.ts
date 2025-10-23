import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface SeasonRow {
  season_id: number
}

interface PlayerStatsRow {
  matches_played: number
  goals: number
  assists: number
  minutes_played: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    console.log('Fetching stats for player ID:', playerId) // Debug log

    // Get current season
    const currentSeason = await query(
      `SELECT season_id FROM seasons WHERE start_date <= CURDATE() AND end_date >= CURDATE() LIMIT 1`
    ) as SeasonRow[]

    console.log('Current season data:', currentSeason) // Debug log

    if (!Array.isArray(currentSeason) || currentSeason.length === 0) {
      console.log('No current season found, using default stats') // Debug log
      return NextResponse.json({ 
        matchesPlayed: 0, 
        goals: 0, 
        assists: 0, 
        performance: 0 
      })
    }

    const seasonId = currentSeason[0].season_id
    console.log('Current season ID:', seasonId) // Debug log

    // Get player stats for current season - updated query
    const playerStats = await query(
      `SELECT 
        COALESCE(SUM(ps.matches_played), 0) as matches_played,
        COALESCE(SUM(ps.goals), 0) as goals,
        COALESCE(SUM(ps.assists), 0) as assists,
        COALESCE(SUM(ps.minutes_played), 0) as minutes_played
       FROM player_stats ps
       JOIN leagues l ON l.league_id = ps.league_id
       WHERE ps.player_id = ? AND l.season_id = ?`,
      [parseInt(playerId), seasonId]
    ) as PlayerStatsRow[]

    console.log('Player stats raw data:', playerStats) // Debug log

    // Calculate performance rating
    let performance = 0
    if (Array.isArray(playerStats) && playerStats.length > 0) {
      const stats = playerStats[0]
      console.log('Processed stats:', stats) // Debug log
      
      // Simple performance calculation
      const goalContribution = (stats.goals + stats.assists) * 15
      const matchParticipation = stats.matches_played > 0 
        ? Math.min((stats.minutes_played / (stats.matches_played * 90)) * 50, 50)
        : 0
      performance = Math.min(goalContribution + matchParticipation, 100)
      
      console.log('Calculated performance:', performance) // Debug log
    }

    const responseData = {
      matchesPlayed: Array.isArray(playerStats) && playerStats.length > 0 ? playerStats[0].matches_played : 0,
      goals: Array.isArray(playerStats) && playerStats.length > 0 ? playerStats[0].goals : 0,
      assists: Array.isArray(playerStats) && playerStats.length > 0 ? playerStats[0].assists : 0,
      performance: Math.round(performance)
    }

    console.log('Final response data:', responseData) // Debug log

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching player stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
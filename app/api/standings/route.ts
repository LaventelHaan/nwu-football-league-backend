import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('league_id')

    if (!leagueId) {
      return NextResponse.json(
        { success: false, error: 'League ID is required' },
        { status: 400 }
      )
    }

    // Direct query that properly handles goal difference calculation
    const standings = await query(`
      SELECT 
        t.team_id,
        t.name AS team_name,
        COALESCE(SUM(
          CASE
            WHEN m.status_key = 'FINAL' AND (
              (t.team_id = f.home_team_id AND m.home_score > m.away_score) OR
              (t.team_id = f.away_team_id AND m.away_score > m.home_score)
            ) THEN 3
            WHEN m.status_key = 'FINAL' AND m.home_score = m.away_score THEN 1
            ELSE 0
          END
        ), 0) AS points,
        
        COALESCE(SUM(
          CASE WHEN m.status_key = 'FINAL' AND (
            (t.team_id = f.home_team_id AND m.home_score > m.away_score) OR
            (t.team_id = f.away_team_id AND m.away_score > m.home_score)
          ) THEN 1 ELSE 0 END
        ), 0) AS wins,
        
        COALESCE(SUM(
          CASE WHEN m.status_key = 'FINAL' AND m.home_score = m.away_score THEN 1 ELSE 0 END
        ), 0) AS draws,
        
        COALESCE(SUM(
          CASE WHEN m.status_key = 'FINAL' AND (
            (t.team_id = f.home_team_id AND m.home_score < m.away_score) OR
            (t.team_id = f.away_team_id AND m.away_score < m.home_score)
          ) THEN 1 ELSE 0 END
        ), 0) AS losses,
        
        COALESCE(SUM(
          CASE 
            WHEN m.status_key = 'FINAL' AND t.team_id = f.home_team_id THEN m.home_score
            WHEN m.status_key = 'FINAL' AND t.team_id = f.away_team_id THEN m.away_score
            ELSE 0 
          END
        ), 0) AS goals_scored,
        
        COALESCE(SUM(
          CASE 
            WHEN m.status_key = 'FINAL' AND t.team_id = f.home_team_id THEN m.away_score
            WHEN m.status_key = 'FINAL' AND t.team_id = f.away_team_id THEN m.home_score
            ELSE 0 
          END
        ), 0) AS goals_conceded,
        
        -- Calculate goal difference using CAST to handle negative numbers
        CAST(
          COALESCE(SUM(
            CASE 
              WHEN m.status_key = 'FINAL' AND t.team_id = f.home_team_id THEN m.home_score
              WHEN m.status_key = 'FINAL' AND t.team_id = f.away_team_id THEN m.away_score
              ELSE 0 
            END
          ), 0) AS SIGNED
        ) - CAST(
          COALESCE(SUM(
            CASE 
              WHEN m.status_key = 'FINAL' AND t.team_id = f.home_team_id THEN m.away_score
              WHEN m.status_key = 'FINAL' AND t.team_id = f.away_team_id THEN m.home_score
              ELSE 0 
            END
          ), 0) AS SIGNED
        ) AS goal_difference,
        
        COUNT(m.match_id) AS matches_played

      FROM teams t
      INNER JOIN league_teams lt ON lt.team_id = t.team_id AND lt.league_id = ?
      LEFT JOIN fixtures f ON (f.home_team_id = t.team_id OR f.away_team_id = t.team_id) 
        AND f.league_id = ? 
        AND f.approval_status = 'APPROVED'
      LEFT JOIN matches m ON m.fixture_id = f.fixture_id AND m.status_key = 'FINAL'
      
      GROUP BY t.team_id, t.name
      ORDER BY 
        points DESC,
        goal_difference DESC,
        goals_scored DESC,
        wins DESC,
        team_name ASC
    `, [leagueId, leagueId]) as any[]

    // Get recent form for each team
    const standingsWithForm = await Promise.all(
      standings.map(async (team) => {
        const recentMatches = await query(`
          SELECT 
            f.fixture_id,
            f.home_team_id,
            f.away_team_id,
            m.home_score,
            m.away_score,
            m.status_key
          FROM fixtures f
          JOIN matches m ON m.fixture_id = f.fixture_id
          WHERE m.status_key = 'FINAL'
            AND f.league_id = ?
            AND (f.home_team_id = ? OR f.away_team_id = ?)
          ORDER BY f.scheduled_at DESC
          LIMIT 5
        `, [leagueId, team.team_id, team.team_id]) as any[]

        const form = recentMatches.map(match => {
          if (match.status_key !== 'FINAL') return '-'
          
          const isHomeTeam = match.home_team_id === team.team_id
          const teamScore = isHomeTeam ? match.home_score : match.away_score
          const opponentScore = isHomeTeam ? match.away_score : match.home_score
          
          if (teamScore > opponentScore) return 'W'
          if (teamScore === opponentScore) return 'D'
          return 'L'
        })

        // Pad with '-' if less than 5 matches
        while (form.length < 5) {
          form.push('-')
        }

        return {
          ...team,
          form,
          trend: "same"
        }
      })
    )

    return NextResponse.json({
      success: true,
      standings: standingsWithForm.map((team, index) => ({
        ...team,
        position: index + 1
      }))
    })
  } catch (error) {
    console.error('Error fetching standings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}
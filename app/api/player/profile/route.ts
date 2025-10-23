import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface PlayerProfileRow {
  player_id: number
  name: string
  first_name: string
  last_name: string
  email: string
  team_id: number
  team_name: string
  joined_at: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const playerData = await query(
      `SELECT 
        p.player_id,
        CONCAT(up.first_name, ' ', up.last_name) as name,
        up.first_name,
        up.last_name,
        u.email,
        t.team_id,
        t.name as team_name,
        tm.joined_at
       FROM players p
       JOIN users u ON u.user_id = p.user_id
       JOIN user_profiles up ON up.user_id = u.user_id
       LEFT JOIN team_memberships tm ON tm.player_id = p.player_id AND tm.left_at IS NULL
       LEFT JOIN teams t ON t.team_id = tm.team_id
       WHERE p.user_id = ?`,
      [parseInt(userId)]
    ) as PlayerProfileRow[]

    if (!Array.isArray(playerData) || playerData.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json({
      player_id: playerData[0].player_id,
      name: playerData[0].name,
      email: playerData[0].email,
      team_id: playerData[0].team_id,
      team: playerData[0].team_name
    })

  } catch (error) {
    console.error('Error fetching player profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
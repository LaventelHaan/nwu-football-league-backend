import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface TrialInviteRow {
  id: string
  scouterName: string
  teamName: string
  message: string
  status: string
  createdAt: string
  trialDate: string
  venue: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    const invites = await query(
      `SELECT 
        ti.invitation_id as id,
        CONCAT(up.first_name, ' ', up.last_name) as scouterName,
        t.name as teamName,
        ti.message,
        ti.status_key as status,
        DATE_FORMAT(ti.sent_at, '%Y-%m-%d') as createdAt,
        te.starts_at as trialDate,
        v.name as venue
       FROM trial_invitations ti
       JOIN trial_events te ON te.trial_id = ti.trial_id
       JOIN users u ON u.user_id = ti.scout_user_id
       JOIN user_profiles up ON up.user_id = u.user_id
       LEFT JOIN teams t ON t.team_id = te.team_id
       LEFT JOIN venue_fields vf ON vf.field_id = te.venue_field_id
       LEFT JOIN venues v ON v.venue_id = vf.venue_id
       WHERE ti.player_id = ?
       ORDER BY ti.sent_at DESC`,
      [parseInt(playerId)]
    ) as TrialInviteRow[]

    return NextResponse.json(Array.isArray(invites) ? invites : [])

  } catch (error) {
    console.error('Error fetching trial invites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { invitationId, status } = await request.json()

    if (!invitationId || !status) {
      return NextResponse.json({ error: 'Invitation ID and status are required' }, { status: 400 })
    }

    await query(
      `UPDATE trial_invitations 
       SET status_key = ?, responded_at = NOW() 
       WHERE invitation_id = ?`,
      [status, parseInt(invitationId)]
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating invitation status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
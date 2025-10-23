import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface AnnouncementRow {
  id: string
  title: string
  message: string
  date: string
  priority: string
  team: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
    }

    console.log('Fetching announcements for team:', teamId)

    // Updated query - fixed JOIN condition
    const announcements = await query(
      `SELECT 
        n.notification_id as id,
        n.title,
        n.body as message,
        DATE_FORMAT(n.created_at, '%Y-%m-%d') as date,
        'medium' as priority,
        t.name as team
       FROM notifications n
       JOIN teams t ON t.team_id = ?
       WHERE n.type_key = 'ANNOUNCEMENT'
       AND n.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY n.created_at DESC
       LIMIT 10`,
      [parseInt(teamId)]
    ) as AnnouncementRow[]

    console.log('Announcements found:', announcements)

    return NextResponse.json(Array.isArray(announcements) ? announcements : [])

  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
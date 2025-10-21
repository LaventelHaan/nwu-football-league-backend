import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const activities = await query(`
      (
        SELECT 
          team_id as id,
          'Team Registration' as action,
          CONCAT(name, ' submitted registration application') as description,
          created_at as timestamp,
          approval_status as type,
          created_by as user_id
        FROM teams 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY created_at DESC 
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          fixture_id as id,
          'Fixture Created' as action,
          CONCAT(ht.name, ' vs ', at.name, ' scheduled') as description,
          f.scheduled_at as timestamp,  -- Changed from f.created_at to f.scheduled_at
          f.approval_status as type,
          f.created_by as user_id
        FROM fixtures f
        JOIN teams ht ON ht.team_id = f.home_team_id
        JOIN teams at ON at.team_id = f.away_team_id
        WHERE f.scheduled_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)  -- Changed from f.created_at to f.scheduled_at
        ORDER BY f.scheduled_at DESC  -- Changed from f.created_at to f.scheduled_at
        LIMIT 5
      )
      ORDER BY timestamp DESC 
      LIMIT 8
    `) as any[]

    // Format the activities with user names
    const formattedActivities = await Promise.all(
      activities.map(async (activity: any) => {
        try {
          const userResult = await query(`
            SELECT up.first_name, up.last_name 
            FROM users u
            JOIN user_profiles up ON up.user_id = u.user_id
            WHERE u.user_id = ?
          `, [activity.user_id]) as any[]

          const userName = userResult[0] 
            ? `${userResult[0].first_name} ${userResult[0].last_name}`
            : 'System'

          return {
            id: activity.id,
            action: activity.action,
            description: activity.description,
            timestamp: formatTimestamp(activity.timestamp),
            type: mapStatusToType(activity.type),
            user: userName
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          return {
            id: activity.id,
            action: activity.action,
            description: activity.description,
            timestamp: formatTimestamp(activity.timestamp),
            type: mapStatusToType(activity.type),
            user: 'System'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      activities: formattedActivities
    })
  } catch (error) {
    console.error('Error fetching activity data:', error)
    return NextResponse.json(
      { success: false, activities: [] },
      { status: 500 }
    )
  }
}

// Helper function to format timestamp
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

// Helper function to map database status to activity type
function mapStatusToType(status: string): "pending" | "approved" | "completed" {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'pending'
    case 'APPROVED':
      return 'approved'
    case 'FINAL':
      return 'completed'
    default:
      return 'approved'
  }
}
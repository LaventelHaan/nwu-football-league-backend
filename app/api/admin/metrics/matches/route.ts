import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const [total, completed, upcoming] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM matches`),
      query(`SELECT COUNT(*) as count FROM matches WHERE status_key = 'FINAL'`),
      query(`SELECT COUNT(*) as count FROM matches WHERE status_key = 'SCHEDULED'`)
    ]) as any[]

    return NextResponse.json({
      success: true,
      total: total[0]?.count || 0,
      completed: completed[0]?.count || 0,
      upcoming: upcoming[0]?.count || 0
    })
  } catch (error) {
    console.error('Error fetching matches data:', error)
    return NextResponse.json(
      { success: false, total: 0, completed: 0, upcoming: 0 },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM teams 
      WHERE approval_status = 'PENDING'
    `) as any[]

    return NextResponse.json({
      success: true,
      count: result[0]?.count || 0
    })
  } catch (error) {
    console.error('Error fetching pending teams:', error)
    return NextResponse.json(
      { success: false, count: 0 },
      { status: 500 }
    )
  }
}
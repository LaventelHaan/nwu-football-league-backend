import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { field } = body

    if (!['views', 'helpful', 'notHelpful'].includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
    }

    const sql = `UPDATE faqs SET ${field} = ${field} + 1 WHERE faq_id = ?`
    await query(sql, [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating FAQ stats:', error)
    return NextResponse.json({ error: 'Failed to update FAQ stats' }, { status: 500 })
  }
}
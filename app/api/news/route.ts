import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET() {
  try {
    // Using FAQ table as news for now - you might want to create a dedicated news table
    const news = await query(`
      SELECT 
        faq_id as id,
        question as title,
        SUBSTRING(answer_md, 1, 150) as excerpt,
        DATE_FORMAT(created_at, '%Y-%m-%d') as date
      FROM faqs 
      WHERE is_active = TRUE
      ORDER BY created_at DESC 
      LIMIT 5
    `) as any[]

    return NextResponse.json({
      success: true,
      news
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
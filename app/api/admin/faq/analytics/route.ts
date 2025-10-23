import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface CountResult {
  total?: number;
  count?: number;
}

interface MostViewedRow {
  question: string;
  category: string;
  views: number;
}

export async function GET() {
  try {
    const totalFAQs = await query('SELECT COUNT(*) as total FROM faqs') as CountResult[]
    const publishedCount = await query('SELECT COUNT(*) as count FROM faqs WHERE status = "Published"') as CountResult[]
    const draftCount = await query('SELECT COUNT(*) as count FROM faqs WHERE status = "Draft"') as CountResult[]
    const totalViews = await query('SELECT SUM(views) as total FROM faqs') as CountResult[]
    const categoriesCount = await query('SELECT COUNT(DISTINCT tags) as count FROM faqs') as CountResult[]
    
    const mostViewed = await query(`
      SELECT question, tags as category, views 
      FROM faqs 
      ORDER BY views DESC 
      LIMIT 5
    `) as MostViewedRow[]

    const analytics = {
      total: totalFAQs[0]?.total || 0,
      published: publishedCount[0]?.count || 0,
      draft: draftCount[0]?.count || 0,
      totalViews: totalViews[0]?.total || 0,
      categories: categoriesCount[0]?.count || 0,
      mostViewed
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching FAQ analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQ analytics' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface CategoryRow {
  name: string;
  count: number;
  color: string;
}

export async function GET() {
  try {
    const sql = `
      SELECT DISTINCT tags as name, 
             COUNT(*) as count,
             CASE 
               WHEN tags LIKE '%registration%' THEN 'bg-blue-100 text-blue-800 border-blue-200'
               WHEN tags LIKE '%team%' THEN 'bg-green-100 text-green-800 border-green-200'
               WHEN tags LIKE '%match%' THEN 'bg-purple-100 text-purple-800 border-purple-200'
               ELSE 'bg-gray-100 text-gray-800 border-gray-200'
             END as color
      FROM faqs 
      WHERE status = 'Published' 
      GROUP BY tags 
      ORDER BY count DESC
    `
    const categories = await query(sql) as CategoryRow[]
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching FAQ categories:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQ categories' }, { status: 500 })
  }
}
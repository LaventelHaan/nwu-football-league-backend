import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

interface FAQRow {
  id: number;
  question: string;
  answer: string;
  status: string;
  tags: string;
  views: number;
  helpful: number;
  notHelpful: number;
  createdDate: string;
  lastUpdated: string;
  createdBy: string;
  category: string;
}

interface ResultSetHeader {
  insertId: number;
  affectedRows: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let sql = `
      SELECT 
        f.faq_id as id,
        f.question,
        f.answer_md as answer,
        f.status,
        f.tags,
        f.views,
        f.helpful,
        f.notHelpful,
        f.created_at as createdDate,
        f.updated_at as lastUpdated,
        CONCAT(up.first_name, ' ', up.last_name) as createdBy,
        f.tags as category
      FROM faqs f
      LEFT JOIN users u ON f.created_by = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE 1=1
    `
    const params: any[] = []

    if (status && status !== 'ALL') {
      sql += ' AND f.status = ?'
      params.push(status)
    }

    if (category && category !== 'ALL') {
      sql += ' AND f.tags LIKE ?'
      params.push(`%${category}%`)
    }

    if (search) {
      sql += ' AND (f.question LIKE ? OR f.answer_md LIKE ? OR f.tags LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    sql += ' ORDER BY f.updated_at DESC'

    const faqs = await query(sql, params) as FAQRow[]
    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer_md, tags, status, created_by } = body

    if (!question || !answer_md || !tags || !created_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sql = `
      INSERT INTO faqs (question, answer_md, tags, status, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    const result = await query(sql, [question, answer_md, tags, status, created_by, created_by]) as ResultSetHeader
    
    return NextResponse.json({ id: result.insertId }, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}
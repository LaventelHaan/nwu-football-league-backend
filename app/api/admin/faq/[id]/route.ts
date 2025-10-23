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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sql = `
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
      WHERE f.faq_id = ?
    `
    const result = await query(sql, [id]) as FAQRow[]
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { question, answer_md, tags, status, updated_by } = body

    // Build dynamic SQL based on provided fields
    const updates: string[] = []
    const values: any[] = []

    if (question !== undefined) {
      updates.push('question = ?')
      values.push(question)
    }
    if (answer_md !== undefined) {
      updates.push('answer_md = ?')
      values.push(answer_md)
    }
    if (tags !== undefined) {
      updates.push('tags = ?')
      values.push(tags)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }
    if (updated_by !== undefined) {
      updates.push('updated_by = ?')
      values.push(updated_by)
    }

    // Always update the timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP')

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const sql = `UPDATE faqs SET ${updates.join(', ')} WHERE faq_id = ?`
    values.push(id)

    await query(sql, values)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sql = `DELETE FROM faqs WHERE faq_id = ?`
    await query(sql, [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}
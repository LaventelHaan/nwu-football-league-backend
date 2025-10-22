import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;
    const body = await request.json();
    const { name } = body;

    const result = await query(
      `INSERT INTO venue_fields (venue_id, name, is_active) 
       VALUES (?, ?, true)`,
      [venueId, name]
    ) as any;

    return NextResponse.json({ 
      id: result.insertId,
      message: 'Field created successfully' 
    });
  } catch (error) {
    console.error('Error creating field:', error);
    return NextResponse.json({ error: 'Failed to create field' }, { status: 500 });
  }
}
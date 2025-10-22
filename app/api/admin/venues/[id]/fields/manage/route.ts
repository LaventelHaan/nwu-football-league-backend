import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fieldId = searchParams.get('fieldId');
    const venueId = searchParams.get('venueId');
    
    if (!fieldId || !venueId) {
      return NextResponse.json(
        { error: 'Both fieldId and venueId are required' }, 
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, status } = body;

    // Check for active bookings before making field inactive
    if (status === 'Inactive') {
      const activeBookings = await query(`
        SELECT COUNT(*) as count 
        FROM field_bookings 
        WHERE venue_field_id = ? AND status_key IN ('REQUESTED', 'APPROVED')
      `, [fieldId]) as any[];

      if (activeBookings[0].count > 0) {
        return NextResponse.json(
          { error: 'Cannot deactivate field with active bookings' }, 
          { status: 400 }
        );
      }
    }

    await query(
      `UPDATE venue_fields 
       SET name = ?, is_active = ?
       WHERE field_id = ? AND venue_id = ?`,
      [name, status === 'Active', fieldId, venueId]
    );

    return NextResponse.json({ message: 'Field updated successfully' });
  } catch (error) {
    console.error('Error updating field:', error);
    return NextResponse.json({ error: 'Failed to update field' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fieldId = searchParams.get('fieldId');
    const venueId = searchParams.get('venueId');
    
    if (!fieldId || !venueId) {
      return NextResponse.json(
        { error: 'Both fieldId and venueId are required' }, 
        { status: 400 }
      );
    }

    // Check for active bookings
    const activeBookings = await query(`
      SELECT COUNT(*) as count 
      FROM field_bookings 
      WHERE venue_field_id = ? AND status_key IN ('REQUESTED', 'APPROVED')
    `, [fieldId]) as any[];

    if (activeBookings[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete field with active bookings' }, 
        { status: 400 }
      );
    }

    // Hard delete field (only if no active bookings)
    await query(
      `DELETE FROM venue_fields WHERE field_id = ? AND venue_id = ?`,
      [fieldId, venueId]
    );

    return NextResponse.json({ message: 'Field deleted successfully' });
  } catch (error) {
    console.error('Error deleting field:', error);
    return NextResponse.json({ error: 'Failed to delete field' }, { status: 500 });
  }
}
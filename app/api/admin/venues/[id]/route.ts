import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;
    
    const venues = await query(
      `SELECT * FROM venues WHERE venue_id = ?`,
      [venueId]
    ) as any[];

    if (venues.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const venue = venues[0];
    
    // Get fields for this venue with booking counts
    const fields = await query(`
      SELECT 
        vf.*,
        COUNT(DISTINCT fb.booking_id) as active_bookings
      FROM venue_fields vf
      LEFT JOIN field_bookings fb ON fb.venue_field_id = vf.field_id 
        AND fb.status_key IN ('REQUESTED', 'APPROVED')
      WHERE vf.venue_id = ?
      GROUP BY vf.field_id
    `, [venueId]) as any[];

    const transformedVenue = {
      id: venue.venue_id,
      name: venue.name,
      address: venue.address || '',
      city: venue.city || '',
      capacity: venue.capacity || 0,
      surface: venue.surface || 'Natural Grass',
      status: venue.is_active ? 'Active' : 'Inactive',
      type: 'Stadium',
      facilities: [],
      contact: {
        manager: '',
        phone: '',
        email: ''
      },
      fields: fields.map(field => ({
        id: field.field_id,
        name: field.name,
        dimensions: '105m x 68m',
        surface: venue.surface,
        status: field.is_active ? 'Active' : 'Inactive',
        activeBookings: field.active_bookings || 0
      })),
      bookings: 0,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    return NextResponse.json(transformedVenue);
  } catch (error) {
    console.error('Error fetching venue:', error);
    return NextResponse.json({ error: 'Failed to fetch venue' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;
    const body = await request.json();
    const { name, address, city, capacity, surface, status } = body;

    // Check for active bookings before making venue inactive
    if (status === 'Inactive') {
      const activeBookings = await query(`
        SELECT COUNT(*) as count 
        FROM field_bookings fb
        JOIN venue_fields vf ON vf.field_id = fb.venue_field_id
        WHERE vf.venue_id = ? AND fb.status_key IN ('REQUESTED', 'APPROVED')
      `, [venueId]) as any[];

      if (activeBookings[0].count > 0) {
        return NextResponse.json(
          { error: 'Cannot deactivate venue with active bookings' }, 
          { status: 400 }
        );
      }
    }

    await query(
      `UPDATE venues 
       SET name = ?, address = ?, city = ?, capacity = ?, surface = ?, is_active = ?
       WHERE venue_id = ?`,
      [name, address, city, capacity, surface, status === 'Active', venueId]
    );

    return NextResponse.json({ message: 'Venue updated successfully' });
  } catch (error) {
    console.error('Error updating venue:', error);
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id;
    
    // Check for active bookings
    const activeBookings = await query(`
      SELECT COUNT(*) as count 
      FROM field_bookings fb
      JOIN venue_fields vf ON vf.field_id = fb.venue_field_id
      WHERE vf.venue_id = ? AND fb.status_key IN ('REQUESTED', 'APPROVED')
    `, [venueId]) as any[];

    if (activeBookings[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete venue with active bookings' }, 
        { status: 400 }
      );
    }

    // Hard delete venue and its fields (only if no active bookings)
    await query('START TRANSACTION');
    
    // Delete fields first (cascade should handle this, but being explicit)
    await query(`DELETE FROM venue_fields WHERE venue_id = ?`, [venueId]);
    
    // Delete venue
    await query(`DELETE FROM venues WHERE venue_id = ?`, [venueId]);
    
    await query('COMMIT');

    return NextResponse.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error deleting venue:', error);
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 });
  }
}
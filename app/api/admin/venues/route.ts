import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const venues = await query(`
      SELECT 
        v.venue_id as id,
        v.name,
        v.address,
        v.city,
        v.capacity,
        v.surface,
        v.is_active,
        COUNT(DISTINCT vf.field_id) as field_count,
        COUNT(DISTINCT fb.booking_id) as booking_count
      FROM venues v
      LEFT JOIN venue_fields vf ON vf.venue_id = v.venue_id
      LEFT JOIN field_bookings fb ON fb.venue_field_id = vf.field_id
      GROUP BY v.venue_id
      ORDER BY v.name
    `);

    // Transform database data to match frontend expectations
    const transformedVenues = (venues as any[]).map(venue => ({
      id: venue.id,
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
      fields: [],
      bookings: venue.booking_count || 0,
      fieldCount: venue.field_count || 0,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    return NextResponse.json(transformedVenues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, city, capacity, surface, fields } = body;

    // Start transaction for venue and fields creation
    const result = await query('START TRANSACTION');
    
    // Create venue
    const venueResult = await query(
      `INSERT INTO venues (name, address, city, capacity, surface, is_active) 
       VALUES (?, ?, ?, ?, ?, true)`,
      [name, address, city, capacity, surface]
    ) as any;

    const venueId = venueResult.insertId;

    // Create fields if provided
    if (fields && fields.length > 0) {
      for (const field of fields) {
        await query(
          `INSERT INTO venue_fields (venue_id, name, is_active) 
           VALUES (?, ?, true)`,
          [venueId, field.name]
        );
      }
    }

    await query('COMMIT');

    return NextResponse.json({ 
      id: venueId,
      message: 'Venue created successfully' 
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating venue:', error);
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
  }
}
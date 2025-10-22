import { NextRequest, NextResponse } from 'next/server'
import * as liveMatchService from '@/lib/liveMatchService'

export async function GET() {
  try {
    const eventTypes = await liveMatchService.getEventTypes()
    return NextResponse.json(eventTypes)
  } catch (error) {
    console.error('Error fetching event types:', error)
    return NextResponse.json({ error: 'Failed to fetch event types' }, { status: 500 })
  }
}
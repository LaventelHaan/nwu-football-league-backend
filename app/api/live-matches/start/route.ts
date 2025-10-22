import { NextRequest, NextResponse } from 'next/server'
import * as liveMatchService from '@/lib/liveMatchService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For manual matches, we need to handle this differently since we don't have fixtures
    // This is a simplified implementation - you might want to create a proper fixture first
    const { homeTeam, awayTeam, venue } = body
    
    // Create a minimal fixture and match for manual games
    // This is a temporary solution - you might want to implement proper manual match creation
    const matchId = await liveMatchService.startManualMatch({ homeTeam, awayTeam, venue })
    
    return NextResponse.json({ matchId })
  } catch (error) {
    console.error('Error starting manual match:', error)
    return NextResponse.json({ error: 'Failed to start match' }, { status: 500 })
  }
}


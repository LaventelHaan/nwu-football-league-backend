import { NextRequest, NextResponse } from 'next/server'
import * as liveMatchService from '@/lib/liveMatchService'

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    console.log('=== FETCHING MATCHES ===');
    console.log('Current time:', now.toISOString());
    console.log('Looking ahead to:', sevenDaysFromNow.toISOString());
    
    // Get scheduled fixtures and active matches
    const [scheduledFixtures, activeMatches] = await Promise.all([
      liveMatchService.getScheduledFixtures(),
      liveMatchService.getActiveLiveMatches()
    ]);
    
    console.log('Scheduled fixtures found:', scheduledFixtures.length);
    console.log('Active matches found:', activeMatches.length);
    
    // Combine and format all matches
    const allMatches = [...scheduledFixtures, ...activeMatches];
    
    const formattedMatches = await Promise.all(
      allMatches.map(async (match: any) => {
        const recentEvents = match.matchId ? await liveMatchService.getMatchRecentEvents(match.matchId) : [];
        const scheduledAt = new Date(match.scheduledAt);
        const isLive = match.status === 'IN_PROGRESS';
        
        // A match can start if it's scheduled within the next 30 minutes OR if it's already past its start time but not live yet
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const canStart = !isLive && scheduledAt <= thirtyMinutesFromNow && scheduledAt >= now;
        
        // Calculate approximate minute for live matches
        let minute = 0;
        if (isLive) {
          const elapsedMs = now.getTime() - scheduledAt.getTime();
          minute = Math.max(0, Math.min(90, Math.floor(elapsedMs / (60 * 1000))));
        }
        
        const formattedMatch = {
          id: match.matchId || match.fixtureId,
          fixtureId: match.fixtureId,
          matchId: match.matchId,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          minute: minute,
          status: match.status,
          venue: match.venue,
          duration: 90,
          isAutomatic: true,
          scheduledAt: match.scheduledAt,
          isLive,
          canStart,
          events: {
            corners: { 
              home: match.corners_home || 0, 
              away: match.corners_away || 0 
            },
            yellowCards: { 
              home: match.yellow_cards_home || 0, 
              away: match.yellow_cards_away || 0 
            },
            redCards: { 
              home: match.red_cards_home || 0, 
              away: match.red_cards_away || 0 
            },
          },
          recentEvents
        };
        
        console.log('Match:', formattedMatch.homeTeam, 'vs', formattedMatch.awayTeam, 
          '| Scheduled:', formattedMatch.scheduledAt,
          '| Status:', formattedMatch.status, 
          '| IsLive:', formattedMatch.isLive, 
          '| CanStart:', formattedMatch.canStart);
        
        return formattedMatch;
      })
    );
    
    console.log('Total formatted matches:', formattedMatches.length);
    return NextResponse.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, matchId, fixtureId, data } = body
    
    switch (action) {
      case 'startMatch':
        const startedMatchId = await liveMatchService.startMatch(fixtureId)
        return NextResponse.json({ matchId: startedMatchId })
      case 'updateScore':
        await liveMatchService.updateMatchScore(matchId, data.homeScore, data.awayScore)
        break
      case 'updateStatus':
        await liveMatchService.updateMatchStatus(matchId, data.status)
        break
      case 'updateEvents':
        await liveMatchService.updateMatchEvents(matchId, data.eventType, data.homeCount, data.awayCount)
        break
      case 'addEvent':
        await liveMatchService.addMatchEvent(data.event)
        break
      case 'endMatch':
        await liveMatchService.endMatch(matchId)
        break
      case 'resetMatch':
        await liveMatchService.resetMatch(matchId)
        break
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in live matches API:', error)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
}
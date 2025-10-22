import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamFilter = searchParams.get('team');
    const positionFilter = searchParams.get('position');
    const statusFilter = searchParams.get('status');

    // First, get all available teams and positions for filters
    const teamsResult = await query(`
      SELECT DISTINCT t.name 
      FROM teams t 
      WHERE t.approval_status = 'APPROVED'
      ORDER BY t.name
    `) as any[];

    const positionsResult = await query(`
      SELECT position_name, position_key 
      FROM player_position 
      ORDER BY position_name
    `) as any[];

    let baseQuery = `
      SELECT 
        p.player_id as id,
        up.first_name,
        up.last_name,
        CONCAT(up.first_name, ' ', up.last_name) as name,
        u.email,
        p.dominant_foot as preferredFoot,
        p.height_cm as height,
        pp.position_name as position,
        pp.position_key as positionKey,
        t.name as team,
        t.team_id as teamId,
        tm.joined_at as joinDate,
        tm.squad_number as jerseyNumber,
        CASE 
          WHEN tm.approval_status = 'APPROVED' AND tm.left_at IS NULL THEN 'Active'
          WHEN tm.left_at IS NOT NULL THEN 'Transferred'
          ELSE 'Inactive'
        END as status,
        COALESCE(
          (SELECT status FROM player_injuries WHERE player_id = p.player_id AND status = 'Active' LIMIT 1),
          'Fit'
        ) as medicalStatus,
        up.birth_date,
        FLOOR(DATEDIFF(CURDATE(), up.birth_date) / 365.25) as age,
        '' as phone,
        '' as emergencyContact,
        '' as nationality,
        '' as weight,
        l.name as league,
        DATE_ADD(tm.joined_at, INTERVAL 1 YEAR) as contractExpiry
      FROM players p
      JOIN user_profiles up ON up.user_id = p.user_id
      JOIN users u ON u.user_id = p.user_id
      LEFT JOIN team_memberships tm ON tm.player_id = p.player_id AND tm.left_at IS NULL
      LEFT JOIN teams t ON t.team_id = tm.team_id
      LEFT JOIN player_position pp ON pp.position_key = p.preferred_position
      LEFT JOIN leagues l ON l.league_id = (SELECT league_id FROM league_teams lt WHERE lt.team_id = t.team_id LIMIT 1)
      WHERE u.is_active = true
    `;

    const params: any[] = [];

    // Apply filters
    if (teamFilter && teamFilter !== 'ALL') {
      baseQuery += ' AND t.name = ?';
      params.push(teamFilter);
    }

    if (positionFilter && positionFilter !== 'ALL') {
      baseQuery += ' AND pp.position_name = ?';
      params.push(positionFilter);
    }

    if (statusFilter && statusFilter !== 'ALL') {
      if (statusFilter === 'Active') {
        baseQuery += ' AND tm.approval_status = "APPROVED" AND tm.left_at IS NULL';
      } else if (statusFilter === 'Injured') {
        baseQuery += ' AND EXISTS (SELECT 1 FROM player_injuries pi WHERE pi.player_id = p.player_id AND pi.status = "Active")';
      } else if (statusFilter === 'Suspended') {
        // You might want to add a suspensions table
        baseQuery += ' AND 1=0'; // Placeholder - no suspensions table yet
      } else if (statusFilter === 'Transferred') {
        baseQuery += ' AND tm.left_at IS NOT NULL';
      }
    }

    baseQuery += ' ORDER BY up.first_name, up.last_name';

    const players = await query(baseQuery, params) as any[];

    // Get player statistics
    const playerIds = players.map(p => p.id);
    let playerStats: any[] = [];
    
    if (playerIds.length > 0) {
      const statsQuery = `
        SELECT 
          ps.player_id,
          SUM(ps.matches_played) as matches_played,
          SUM(ps.goals) as goals,
          SUM(ps.assists) as assists,
          SUM(ps.yellow_cards) as yellow_cards,
          SUM(ps.red_cards) as red_cards
        FROM player_stats ps
        WHERE ps.player_id IN (${playerIds.map(() => '?').join(',')})
        GROUP BY ps.player_id
      `;
      playerStats = await query(statsQuery, playerIds) as any[];
    }

    // Transform data for frontend
    const transformedPlayers = players.map(player => {
      const stats = playerStats.find(stat => stat.player_id === player.id) || {};
      
      return {
        id: player.id,
        name: player.name,
        email: player.email,
        team: player.team || 'Free Agent',
        position: player.position || 'Not Specified',
        status: player.status,
        medicalStatus: player.medicalStatus,
        age: player.age || 0,
        jerseyNumber: player.jerseyNumber || 0,
        height: player.height ? `${player.height}cm` : 'Not specified',
        preferredFoot: player.preferredFoot || 'Not specified',
        weight: player.weight || 'Not specified',
        phone: player.phone,
        emergencyContact: player.emergencyContact,
        nationality: player.nationality,
        league: player.league || 'No League',
        joinDate: player.joinDate ? new Date(player.joinDate).toLocaleDateString() : 'Not specified',
        contractExpiry: player.contractExpiry ? new Date(player.contractExpiry).toLocaleDateString() : 'Not specified',
        matchesPlayed: stats.matches_played || 0,
        goals: stats.goals || 0,
        assists: stats.assists || 0,
        yellowCards: stats.yellow_cards || 0,
        redCards: stats.red_cards || 0,
        rating: calculatePlayerRating(stats),
        previousClubs: [], // Will be populated in detail view
        achievements: []
      };
    });

    return NextResponse.json({
      players: transformedPlayers,
      filters: {
        teams: ['ALL', ...teamsResult.map((t: any) => t.name)],
        positions: ['ALL', ...positionsResult.map((p: any) => p.position_name)]
      }
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

// Helper function to calculate player rating
function calculatePlayerRating(stats: any): number {
  const { matches_played = 0, goals = 0, assists = 0 } = stats;
  
  if (matches_played === 0) return 6.0;
  
  const baseRating = 6.0;
  const goalContribution = (goals + assists) / matches_played;
  const rating = Math.min(10.0, baseRating + (goalContribution * 2));
  
  return Math.round(rating * 10) / 10;
}
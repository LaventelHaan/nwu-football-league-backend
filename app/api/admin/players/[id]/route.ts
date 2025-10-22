import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    const body = await request.json();
    const { 
      jerseyNumber, 
      position,
      medicalStatus 
    } = body;

    // Update team membership (jersey number)
    if (jerseyNumber !== undefined) {
      await query(
        `UPDATE team_memberships SET squad_number = ? WHERE player_id = ? AND left_at IS NULL`,
        [jerseyNumber, playerId]
      );
    }

    // Update player preferred position
    if (position) {
      // Get position key from position name
      const positionResult = await query(
        `SELECT position_key FROM player_position WHERE position_name = ?`,
        [position]
      ) as any[];

      if (positionResult.length > 0) {
        const positionKey = positionResult[0].position_key;
        await query(
          `UPDATE players SET preferred_position = ? WHERE player_id = ?`,
          [positionKey, playerId]
        );
      }
    }

    // Update medical status (this would involve the injuries table)
    if (medicalStatus && medicalStatus !== 'Fit') {
      // If setting to injured, you might want to create an injury record
      // For now, we'll just track active injuries
      if (medicalStatus === 'Injured') {
        // Check if there's already an active injury
        const existingInjury = await query(
          `SELECT injury_id FROM player_injuries WHERE player_id = ? AND status = 'Active'`,
          [playerId]
        ) as any[];

        if (existingInjury.length === 0) {
          // Create a generic injury record
          await query(
            `INSERT INTO player_injuries (player_id, injury_type, injury_date, severity, status) 
             VALUES (?, 'General Injury', CURDATE(), 'Moderate', 'Active')`,
            [playerId]
          );
        }
      } else if (medicalStatus === 'Fit') {
        // Mark all active injuries as recovered
        await query(
          `UPDATE player_injuries SET status = 'Recovered' WHERE player_id = ? AND status = 'Active'`,
          [playerId]
        );
      }
    }

    return NextResponse.json({ message: 'Player updated successfully' });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

// Keep the GET function as it was (without the params variable issue)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;

    const playerQuery = `
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
        up.bio,
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
      WHERE p.player_id = ?
    `;

    const players = await query(playerQuery, [playerId]) as any[];

    if (players.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = players[0];

    // Get player statistics (aggregate across all leagues)
    const statsQuery = `
      SELECT 
        SUM(matches_played) as matches_played,
        SUM(goals) as goals,
        SUM(assists) as assists,
        SUM(yellow_cards) as yellow_cards,
        SUM(red_cards) as red_cards,
        SUM(minutes_played) as minutes_played
      FROM player_stats 
      WHERE player_id = ?
    `;

    const stats = await query(statsQuery, [playerId]) as any[];
    const playerStats = stats[0] || {};

    // Get previous clubs
    const previousClubsQuery = `
      SELECT DISTINCT t.name, tm.joined_at, tm.left_at
      FROM team_memberships tm
      JOIN teams t ON t.team_id = tm.team_id
      WHERE tm.player_id = ? AND tm.left_at IS NOT NULL
      ORDER BY tm.left_at DESC
    `;

    const previousClubs = await query(previousClubsQuery, [playerId]) as any[];

    // Get injuries
    const injuriesQuery = `
      SELECT injury_type, injury_date, expected_return, severity
      FROM player_injuries
      WHERE player_id = ? AND status = 'Active'
      ORDER BY injury_date DESC
    `;

    const injuries = await query(injuriesQuery, [playerId]) as any[];

    // Get achievements from match events (goals, assists, etc.)
    const achievementsQuery = `
      SELECT DISTINCT 
        CONCAT('Scored in match vs ', 
          CASE 
            WHEN f.home_team_id = t.team_id THEN away_t.name
            ELSE home_t.name
          END
        ) as achievement
      FROM match_events me
      JOIN matches m ON m.match_id = me.match_id
      JOIN fixtures f ON f.fixture_id = m.fixture_id
      JOIN teams home_t ON home_t.team_id = f.home_team_id
      JOIN teams away_t ON away_t.team_id = f.away_team_id
      JOIN teams t ON t.team_id = me.team_id
      WHERE me.player_id = ? AND me.event_key IN ('GOAL', 'PENALTY_GOAL')
      LIMIT 5
    `;

    const achievements = await query(achievementsQuery, [playerId]) as any[];

    const transformedPlayer = {
      ...player,
      league: player.league || 'No League',
      contractExpiry: player.contractExpiry ? new Date(player.contractExpiry).toLocaleDateString() : 'Not specified',
      joinDate: player.joinDate ? new Date(player.joinDate).toLocaleDateString() : 'Not specified',
      matchesPlayed: playerStats.matches_played || 0,
      goals: playerStats.goals || 0,
      assists: playerStats.assists || 0,
      yellowCards: playerStats.yellow_cards || 0,
      redCards: playerStats.red_cards || 0,
      minutesPlayed: playerStats.minutes_played || 0,
      rating: calculatePlayerRating(playerStats),
      previousClubs: previousClubs.map((club: any) => club.name),
      achievements: achievements.map((a: any) => a.achievement),
      injuries: injuries,
      bio: player.bio || 'No bio available'
    };

    return NextResponse.json(transformedPlayer);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
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
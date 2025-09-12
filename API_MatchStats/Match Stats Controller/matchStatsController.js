const MatchStats = require('../models/matchStatsModel');

const matchStatsController = {
  // Get completed matches
  getCompletedMatches: (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    
    MatchStats.getCompletedMatches(limit, (err, results) => {
      if (err) {
        console.error('Error fetching completed matches:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json(results);
    });
  },

  // Get match by ID
  getMatchById: (req, res) => {
    const matchId = req.params.id;
    
    MatchStats.getMatchById(matchId, (err, results) => {
      if (err) {
        console.error('Error fetching match:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      res.json(results[0]);
    });
  },

  // Get match events
  getMatchEvents: (req, res) => {
    const matchId = req.params.id;
    
    MatchStats.getMatchEvents(matchId, (err, results) => {
      if (err) {
        console.error('Error fetching match events:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json(results);
    });
  },

  // Get match lineups
  getMatchLineups: (req, res) => {
    const matchId = req.params.id;
    
    MatchStats.getMatchLineups(matchId, (err, results) => {
      if (err) {
        console.error('Error fetching match lineups:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      // Group by team
      const lineups = {};
      results.forEach(player => {
        if (!lineups[player.team_id]) {
          lineups[player.team_id] = {
            team_id: player.team_id,
            team_name: player.team_name,
            players: []
          };
        }
        lineups[player.team_id].players.push(player);
      });
      
      res.json(Object.values(lineups));
    });
  },

  // Get player stats for a match
  getPlayerStatsByMatch: (req, res) => {
    const matchId = req.params.id;
    
    MatchStats.getPlayerStatsByMatch(matchId, (err, results) => {
      if (err) {
        console.error('Error fetching player stats:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json(results);
    });
  },

  // Get complete match stats (all in one)
  getCompleteMatchStats: (req, res) => {
    const matchId = req.params.id;
    
    // Get match details
    MatchStats.getMatchById(matchId, (err, matchDetails) => {
      if (err) {
        console.error('Error fetching match details:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (matchDetails.length === 0) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      // Get match events
      MatchStats.getMatchEvents(matchId, (err, events) => {
        if (err) {
          console.error('Error fetching match events:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Get lineups
        MatchStats.getMatchLineups(matchId, (err, lineups) => {
          if (err) {
            console.error('Error fetching match lineups:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          // Get player stats
          MatchStats.getPlayerStatsByMatch(matchId, (err, playerStats) => {
            if (err) {
              console.error('Error fetching player stats:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }
            
            // Group lineups by team
            const teamLineups = {};
            lineups.forEach(player => {
              if (!teamLineups[player.team_id]) {
                teamLineups[player.team_id] = {
                  team_id: player.team_id,
                  team_name: player.team_name,
                  players: []
                };
              }
              teamLineups[player.team_id].players.push(player);
            });
            
            // Group player stats by team
            const teamPlayerStats = {};
            playerStats.forEach(player => {
              if (!teamPlayerStats[player.team_id]) {
                teamPlayerStats[player.team_id] = {
                  team_id: player.team_id,
                  team_name: player.team_name,
                  players: []
                };
              }
              teamPlayerStats[player.team_id].players.push(player);
            });
            
            // Prepare response
            const response = {
              match: matchDetails[0],
              events: events,
              lineups: Object.values(teamLineups),
              player_stats: Object.values(teamPlayerStats)
            };
            
            res.json(response);
          });
        });
      });
    });
  },

  // Get team performance
  getTeamPerformance: (req, res) => {
    const teamId = req.params.teamId;
    const seasonId = req.query.seasonId || null;
    
    MatchStats.getTeamPerformance(teamId, seasonId, (err, results) => {
      if (err) {
        console.error('Error fetching team performance:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json(results);
    });
  },

  // Get league standings
  getLeagueStandings: (req, res) => {
    const leagueId = req.params.leagueId;
    
    MatchStats.getLeagueStandings(leagueId, (err, results) => {
      if (err) {
        console.error('Error fetching league standings:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json(results);
    });
  },

  // Get top performers
  getTopPerformers: (req, res) => {
    const leagueId = req.params.leagueId;
    const statType = req.query.statType || 'goals';
    const limit = parseInt(req.query.limit) || 10;
    
    MatchStats.getTopPerformers(leagueId, statType, limit, (err, results) => {
      if (err) {
        console.error('Error fetching top performers:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json(results);
    });
  }
};

module.exports = matchStatsController;
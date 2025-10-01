const express = require('express');
const router = express.Router();
const matchStatsController = require('../controllers/matchStatsController');

// Get completed matches
router.get('/matches/completed', matchStatsController.getCompletedMatches);

// Get match by ID
router.get('/matches/:id', matchStatsController.getMatchById);

// Get match events
router.get('/matches/:id/events', matchStatsController.getMatchEvents);

// Get match lineups
router.get('/matches/:id/lineups', matchStatsController.getMatchLineups);

// Get player stats for a match
router.get('/matches/:id/player-stats', matchStatsController.getPlayerStatsByMatch);

// Get complete match stats (all in one)
router.get('/matches/:id/complete', matchStatsController.getCompleteMatchStats);

// Get team performance
router.get('/teams/:teamId/performance', matchStatsController.getTeamPerformance);

// Get top performers
router.get('/leagues/:leagueId/top-performers', matchStatsController.getTopPerformers);

module.exports = router;
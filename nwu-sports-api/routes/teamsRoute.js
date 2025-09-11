import express from 'express';
import {
  getAllTeams,
  getTeamById,
  getLeagueStandings
} from '../controllers/teamsController.js';

const router = express.Router();

// Get full league standings
router.get('/table', getLeagueStandings);

// Get all teams
router.get('/', getAllTeams);

// Get any team by ID
router.get('/:id', getTeamById);

export default router;

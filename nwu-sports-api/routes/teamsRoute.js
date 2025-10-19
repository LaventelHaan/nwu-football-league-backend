import express from 'express';
import {
  getAllTeams,
  getTeamById,
  getStandingsTable
} from '../controllers/teamsController.js';

const router = express.Router();

router.get('/table', getStandingsTable);
router.get('/', getAllTeams);
router.get('/:id', getTeamById);

export default router;
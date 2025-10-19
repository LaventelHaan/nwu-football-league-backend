import express from 'express';
import { getAllPlayers, 
		getTopPerformers,
		getPlayerById} 
		from '../controllers/playersController.js';

const router = express.Router();

// GET players and top performers routes
router.get('/players', getAllPlayers);
router.get('/players/:player_id', getPlayerById);
router.get('/top-performers', getTopPerformers);

export default router;
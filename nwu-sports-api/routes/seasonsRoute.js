import express from 'express';
import { getCurrentSeason } from '../controllers/seasonsController.js';

const router = express.Router();

// GET current season
router.get('/current', getCurrentSeason);

export default router;
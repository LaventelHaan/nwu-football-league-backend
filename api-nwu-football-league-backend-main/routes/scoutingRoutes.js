import express from 'express';
import { getAllReports, getWatchlist, addToWatchlist, updateWatchlistPlayer } from '../controllers/scoutingController.js';

const router = express.Router();

router.get("/reports", getAllReports);
router.get("/watchlist", getWatchlist);
router.post("/watchlist", addToWatchlist );
router.put("/watchlist/:id", updateWatchlistPlayer );

export default router;
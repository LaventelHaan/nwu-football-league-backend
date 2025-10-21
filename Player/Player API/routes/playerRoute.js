import express from 'express';
import { 
	getPlayerByEmail,
	getInvitesByPlayerId,
	updateInviteStatus,
	getAnnouncementsByPlayerId,
	getFixturesByPlayerId,
	getFixtureDetails
	} 
	from '../controllers/playerController.js';

const router = express.Router()

// Player routes
router.get('/player/:email', getPlayerByEmail)
router.get('/player/invites/:id', getInvitesByPlayerId)
router.put('/player/invites/:id', updateInviteStatus)
router.get('/player/announcements/:id', getAnnouncementsByPlayerId)
router.get('/player/fixtures/:id', getFixturesByPlayerId)
router.get('/player/matches/:id', getFixtureDetails)

export default router
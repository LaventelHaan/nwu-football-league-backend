const express = require('express');
const router = express.Router();
const teamController = require('../Team Controller/teamController');

router.get('/teams', teamController.getAllTeams);
router.get('/teams/:id', teamController.getTeamById);
router.post('/teams', teamController.addTeam);
router.put('/teams/:id', teamController.updateTeam);
router.delete('/teams/:id', teamController.deleteTeam);

module.exports = router;
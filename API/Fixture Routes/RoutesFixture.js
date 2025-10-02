const express = require('express');
const router = express.Router();
const fixtureController = require('../Fixture Controller/fixtureController');

router.get('/fixtures', fixtureController.getAllFixtures);
router.get('/fixtures/:id', fixtureController.getFixtureById);
router.post('/fixtures', fixtureController.addFixture);
router.put('/fixtures/:id', fixtureController.updateFixture);
router.delete('/fixtures/:id', fixtureController.deleteFixture);

module.exports = router;
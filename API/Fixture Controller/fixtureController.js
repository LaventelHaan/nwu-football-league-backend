const Fixture = require('../Fixture Model/FixtureModel');

module.exports = {
  getAllFixtures: (req, res) => Fixture.getAll((err, fixtures) => err ? res.status(500).json({ error: err }) : res.json(fixtures)),
  getFixtureById: (req, res) => Fixture.getById(parseInt(req.params.id), (err, fixture) => fixture ? res.json(fixture) : res.status(404).json({ error: 'Not found' })),
  addFixture: (req, res) => Fixture.add(req.body, (err, fixture) => err ? res.status(500).json({ error: err }) : res.status(201).json(fixture)),
  updateFixture: (req, res) => Fixture.update(parseInt(req.params.id), req.body, (err, fixture) => err ? res.status(404).json({ error: err }) : res.json(fixture)),
  deleteFixture: (req, res) => Fixture.remove(parseInt(req.params.id), (err, fixture) => err ? res.status(404).json({ error: err }) : res.json(fixture)),
};
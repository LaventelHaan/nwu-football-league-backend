const Team = require('../Team Model/TeamModel');

module.exports = {
  getAllTeams: (req, res) => Team.getAll((err, teams) => err ? res.status(500).json({ error: err }) : res.json(teams)),
  getTeamById: (req, res) => Team.getById(parseInt(req.params.id), (err, team) => team ? res.json(team) : res.status(404).json({ error: 'Not found' })),
  addTeam: (req, res) => Team.add(req.body, (err, team) => err ? res.status(500).json({ error: err }) : res.status(201).json(team)),
  updateTeam: (req, res) => Team.update(parseInt(req.params.id), req.body, (err, team) => err ? res.status(404).json({ error: err }) : res.json(team)),
  deleteTeam: (req, res) => Team.remove(parseInt(req.params.id), (err, team) => err ? res.status(404).json({ error: err }) : res.json(team)),
};
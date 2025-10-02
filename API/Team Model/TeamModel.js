// TeamModel.js (mock data)
const teams = [
  { id: 1, name: 'Team A', coach: 'Coach A' },
  { id: 2, name: 'Team B', coach: 'Coach B' }
];

module.exports = {
  getAll: (cb) => cb(null, teams),
  getById: (id, cb) => cb(null, teams.find(t => t.id == id)),
  add: (team, cb) => { team.id = teams.length + 1; teams.push(team); cb(null, team); },
  update: (id, data, cb) => {
    const idx = teams.findIndex(t => t.id == id);
    if (idx === -1) return cb('Not found');
    teams[idx] = { ...teams[idx], ...data };
    cb(null, teams[idx]);
  },
  remove: (id, cb) => {
    const idx = teams.findIndex(t => t.id == id);
    if (idx === -1) return cb('Not found');
    const removed = teams.splice(idx, 1);
    cb(null, removed[0]);
  }
};
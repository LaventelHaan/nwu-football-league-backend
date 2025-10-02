// FixtureModel.js (mock data)
const fixtures = [
  { id: 1, home: 'Team A', away: 'Team B', date: '2025-10-10' },
  { id: 2, home: 'Team C', away: 'Team D', date: '2025-10-11' }
];

module.exports = {
  getAll: (cb) => cb(null, fixtures),
  getById: (id, cb) => cb(null, fixtures.find(f => f.id == id)),
  add: (fixture, cb) => { fixture.id = fixtures.length + 1; fixtures.push(fixture); cb(null, fixture); },
  update: (id, data, cb) => {
    const idx = fixtures.findIndex(f => f.id == id);
    if (idx === -1) return cb('Not found');
    fixtures[idx] = { ...fixtures[idx], ...data };
    cb(null, fixtures[idx]);
  },
  remove: (id, cb) => {
    const idx = fixtures.findIndex(f => f.id == id);
    if (idx === -1) return cb('Not found');
    const removed = fixtures.splice(idx, 1);
    cb(null, removed[0]);
  }
};
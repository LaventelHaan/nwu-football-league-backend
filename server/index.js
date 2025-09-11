
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.FIXTURES_API_PORT || 4000;

app.use(cors());
app.use(express.json());

/* ==========================================================
   Fixtures Repository (Data Access Layer for Fixtures)
   Right now it uses mock data, 
   TODO: Replace with actual database connection (MySQL/PostgreSQL)
========================================================== */
const fixturesRepository = {
  // Mock data - will be replaced with database queries
  mockFixtures: [
    { id: 1, homeTeam: 'NWU Eagles', awayTeam: 'Wits Wolves', date: '2024-01-15', time: '15:00', venue: 'NWU Stadium', status: 'upcoming', round: 'Round 19' },
    { id: 2, homeTeam: 'UCT Lions', awayTeam: 'UP Tuks', date: '2024-01-15', time: '17:30', venue: 'UCT Grounds', status: 'upcoming', round: 'Round 19' },
    { id: 3, homeTeam: 'UJ Orange', awayTeam: 'Stellenbosch FC', date: '2024-01-16', time: '14:00', venue: 'UJ Stadium', status: 'upcoming', round: 'Round 19' },
    { id: 4, homeTeam: 'Rhodes United', awayTeam: 'UKZN Sharks', date: '2024-01-16', time: '16:30', venue: 'Rhodes Park', status: 'upcoming', round: 'Round 19' }
  ],

  // Method to get all fixtures - easy to replace with DB query
  async getAllFixtures() {
    // TODO: Replace with: SELECT * FROM fixtures WHERE status = 'upcoming' ORDER BY scheduled_at
    return this.mockFixtures;
  }
};
/* ==========================================================
   Results Repository (Data Access Layer for Results)
   Same idea: mocked data now, DB queries later
========================================================== */
const resultsRepository = {
  // Mock results data
  mockResults: [
    { id: 5, homeTeam: 'NWU Eagles', awayTeam: 'UCT Lions', date: '2024-01-12', time: '14:30', venue: 'UCT Grounds', status: 'final', homeScore: 3, awayScore: 2, round: 'Round 18', attendance: 2500, highlights: ["Goal by J. Doe (15')", "Goal by M. Smith (32')", "Goal by D. Johnson (67')"] },
    { id: 6, homeTeam: 'Wits Wolves', awayTeam: 'UP Tuks', date: '2024-01-12', time: '16:00', venue: 'Wits Stadium', status: 'final', homeScore: 1, awayScore: 1, round: 'Round 18', attendance: 1800, highlights: ["Goal by A. Wilson (23')", "Goal by P. Brown (78')"] },
    { id: 7, homeTeam: 'UJ Orange', awayTeam: 'Rhodes United', date: '2024-01-11', time: '15:30', venue: 'UJ Stadium', status: 'final', homeScore: 2, awayScore: 0, round: 'Round 18', attendance: 1200, highlights: ["Goal by K. Davis (41')", "Goal by L. Taylor (89')"] },
    { id: 8, homeTeam: 'Stellenbosch FC', awayTeam: 'UKZN Sharks', date: '2024-01-11', time: '17:00', venue: 'Stellenbosch Stadium', status: 'final', homeScore: 4, awayScore: 1, round: 'Round 18', attendance: 900, highlights: [
      "Goal by R. Miller (12')",
      "Goal by S. Clark (34')",
      "Goal by T. White (56')",
      "Goal by J. Green (72')",
    ] },
  ],

  // Method to get all results - easy to replace with DB query
  async getAllResults() {
    // TODO: Replace with: SELECT f.*, m.home_score, m.away_score, m.attendance FROM fixtures f JOIN matches m ON f.fixture_id = m.fixture_id WHERE f.status = 'final' ORDER BY f.scheduled_at DESC
    return this.mockResults;
  }

  /* Add a new result
  async addResult(resultData) {
    // Replace with INSERT INTO results (...) VALUES (...)
    const newResult = { id: Date.now(), ...resultData };
    this.mockResults.push(newResult);
    return newResult;
  }*/
};

// API Routes these will remain the same when we add database
app.get('/api/fixtures', async (req, res) => {
  try {
    const fixtures = await fixturesRepository.getAllFixtures();
    res.json({ fixtures });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});
/*// POST /api/fixtures → add a new fixture
app.post('/api/fixtures', async (req, res) => {
  try {
    const newFixture = await fixturesRepository.addFixture(req.body);
    res.status(201).json(newFixture);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add fixture' });
  }
});
*/
// GET /api/results → list all match results
app.get('/api/results', async (req, res) => {
  try {
    const results = await resultsRepository.getAllResults();
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});
/*// POST /api/results → add a new result
app.post('/api/results', async (req, res) => {
  try {
    const newResult = await resultsRepository.addResult(req.body);
    res.status(201).json(newResult);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add result' });
  }
});
*/
// Health check (useful for deployment + monitoring)
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});
//  Server Startupye
app.listen(PORT, () => {
  console.log(`[fixtures-api] listening on http://localhost:${PORT}`);
});





const express = require('express');
const cors = require('cors');

const fixturesRouter = require('./routes/fixtures');
const resultsRouter = require('./routes/results');
const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const standingsRouter = require('./routes/standings');
const announcementsRouter = require('./routes/announcements');
const venuesRouter = require('./routes/venues');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Fixtures API

app.use('/api/fixtures', fixturesRouter);
app.use('/api/results', resultsRouter);
app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/standings', standingsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/venues', venuesRouter);

app.get('/', (req, res) => {
  res.send('NWU Football League Backend API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

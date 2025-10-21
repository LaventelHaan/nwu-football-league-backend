// Express.js server entry point for admin backend
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const venuesRouter = require('./routes/venues');
const playersRouter = require('./routes/players');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/venues', venuesRouter);
app.use('/api/players', playersRouter);

app.get('/', (req, res) => {
  res.send('NWU Sports League Admin Backend Running');
});

app.listen(PORT, () => {
  console.log(`Admin backend server running on port ${PORT}`);
});

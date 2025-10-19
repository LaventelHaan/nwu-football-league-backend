import express from 'express';
import cors from 'cors';
import teamsRoute from './routes/teamsRoute.js';
import seasonsRoute from './routes/seasonsRoute.js';

const app = express();
const PORT = 4000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

app.use('/api/standings', teamsRoute);
app.use('/api/seasons', seasonsRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

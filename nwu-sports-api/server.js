import express from 'express';
import cors from 'cors';
import router from './routes/teamsRoute.js';
import seasonsRoute from './routes/seasonsRoute.js';
>>>>>>> 5954b63 (Initializing physical folder)

const app = express();
const PORT = 4000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

app.use('/api/seasons', seasonsRoute);

// Mount teams-related routes
app.use('/api/standings', router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

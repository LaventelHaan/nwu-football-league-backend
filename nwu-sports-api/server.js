import express from 'express';
import cors from 'cors';
import router from './routes/teamsRoute.js';

const app = express();
const PORT = 4000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Mount teams-related routes
app.use('/api/standings', router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

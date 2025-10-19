import express from 'express';
import cors from 'cors';
import playersRoute from './routes/playersRoute.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', playersRoute);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
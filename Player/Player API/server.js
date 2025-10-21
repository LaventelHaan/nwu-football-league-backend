import express from 'express';
import cors from 'cors';
import playersRoute from './routes/playerRoute.js';
import authRoute from './routes/authRoute.js';

const app = express()
const PORT = 3001

app.use(cors());
app.use(express.json());

// Main player routes
app.use("/api", playersRoute)
app.use("/api", authRoute)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
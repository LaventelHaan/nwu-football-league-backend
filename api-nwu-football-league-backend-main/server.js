import express from 'express';
import cors from 'cors';
import scoutingRoutes from './routes/scoutingRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', scoutingRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
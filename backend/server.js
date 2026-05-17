import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidateRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api', matchRoutes); // /api/match and /api/ai/shortlist

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

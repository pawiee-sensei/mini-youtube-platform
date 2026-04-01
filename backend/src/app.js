import authRoutes from './routes/auth.routes.js';
import videoRoutes from './routes/video.routes.js';
import express from 'express';
import cors from 'cors';

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use(cors());
app.use(express.json());

export default app;
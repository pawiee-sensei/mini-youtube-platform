import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes.js';
import videoRoutes from './routes/video.routes.js';
import commentRoutes from './routes/comment.routes.js';
import likeRoutes from './routes/like.routes.js';

const app = express();

// ✅ GLOBAL MIDDLEWARE FIRST
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));


// ✅ ROUTES AFTER MIDDLEWARE

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);

export default app;
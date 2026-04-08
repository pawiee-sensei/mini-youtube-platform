import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes.js';
import videoRoutes from './routes/video.routes.js';
import commentRoutes from './routes/comment.routes.js';
import likeRoutes from './routes/like.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import historyRoutes from './routes/history.routes.js';
import { ensureWatchHistoryTable } from './services/history.service.js';
import {
  ensureCommentReactionsTable,
  ensureCommentRepliesSchema
} from './services/comment.service.js';

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
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/history', historyRoutes);

ensureWatchHistoryTable().catch((err) => {
  console.error('WATCH HISTORY TABLE ERROR:', err);
});

ensureCommentRepliesSchema().catch((err) => {
  console.error('COMMENT REPLIES SCHEMA ERROR:', err);
});

ensureCommentReactionsTable().catch((err) => {
  console.error('COMMENT REACTIONS TABLE ERROR:', err);
});

export default app;

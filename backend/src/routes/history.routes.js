import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { fetchWatchHistory, saveWatchHistory } from '../controllers/history.controller.js';

const router = express.Router();

router.post('/:videoId', authMiddleware, saveWatchHistory);
router.get('/user/:userId', authMiddleware, fetchWatchHistory);

export default router;

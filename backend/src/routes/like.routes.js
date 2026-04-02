import express from 'express';
import { like, unlike } from '../controllers/like.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/:videoId', authMiddleware, like);
router.delete('/:videoId', authMiddleware, unlike);

export default router;
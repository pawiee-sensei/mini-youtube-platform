import express from 'express';
import { createComment, fetchComments } from '../controllers/comment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/:videoId', authMiddleware, createComment);
router.get('/:videoId', fetchComments);

export default router;
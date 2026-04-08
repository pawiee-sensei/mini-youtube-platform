import express from 'express';
import {
  clearCommentReaction,
  createComment,
  fetchComments,
  reactToComment
} from '../controllers/comment.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/:videoId', authMiddleware, createComment);
router.get('/:videoId', optionalAuthMiddleware, fetchComments);
router.post('/:commentId/reaction', authMiddleware, reactToComment);
router.delete('/:commentId/reaction', authMiddleware, clearCommentReaction);

export default router;

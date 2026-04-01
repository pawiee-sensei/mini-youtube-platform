import express from 'express';
import { uploadVideo, fetchVideos, fetchVideo } from '../controllers/video.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, uploadVideo);
router.get('/', fetchVideos);
router.get('/:id', fetchVideo);

export default router;
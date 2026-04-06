import express from 'express';
import {
  uploadVideoWithFiles,
  fetchVideos,
  fetchVideo,
  fetchVideosByUser,
  addVideoView,
  updateVideo,
  deleteVideo
} from '../controllers/video.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post(
  '/upload',
  authMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  uploadVideoWithFiles
);
router.get('/', fetchVideos);
router.get('/user/:userId', fetchVideosByUser);
router.post('/:id/view', addVideoView);
router.put('/:id', authMiddleware, updateVideo);
router.delete('/:id', authMiddleware, deleteVideo);
router.get('/:id', fetchVideo);

export default router;

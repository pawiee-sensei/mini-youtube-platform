import { createVideo, getAllVideos, getVideoById } from '../services/video.service.js';
import { getVideosByUser } from '../services/video.service.js';

export const uploadVideo = async (req, res) => {
  try {
    const videoId = await createVideo({
      ...req.body,
      user_id: req.user.id
    });
    res.json({ videoId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchVideos = async (req, res) => {
  const videos = await getAllVideos();
  res.json(videos);
};

export const fetchVideo = async (req, res) => {
  const video = await getVideoById(req.params.id);
  res.json(video);
};

export const fetchVideosByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await getVideosByUser(userId);

    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
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

export const uploadVideoWithFiles = async (req, res) => {
  try {
    const { title, description } = req.body;

    const videoFile = req.files?.video?.[0];
    const thumbFile = req.files?.thumbnail?.[0];

    if (!videoFile) {
      return res.status(400).json({ message: 'Video file required' });
    }

    const video_url = `/uploads/videos/${videoFile.filename}`;
    const thumbnail_url = thumbFile
      ? `/uploads/thumbnails/${thumbFile.filename}`
      : null;

    const videoId = await createVideo({
      user_id: req.user.id,
      title,
      description,
      video_url,
      thumbnail_url
    });

    res.json({
      message: 'Uploaded successfully',
      videoId,
      video_url,
      thumbnail_url
    });

  } catch (err) {
    console.error('UPLOAD VIDEO ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

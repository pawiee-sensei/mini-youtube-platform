import {
  createVideo,
  getAllVideos,
  getVideoById,
  getVideosByUser,
  deleteVideoById,
  updateVideoById
} from '../services/video.service.js';

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

export const deleteVideo = async (req, res) => {
  try {
    const result = await deleteVideoById(req.params.id, req.user.id);

    if (!result) {
      return res.status(404).json({ message: 'Video not found or not allowed' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('DELETE VIDEO ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const result = await updateVideoById(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!result) {
      return res.status(404).json({ message: 'Video not found or not allowed' });
    }

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('UPDATE VIDEO ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

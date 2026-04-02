import { likeVideo, unlikeVideo } from '../services/like.service.js';

export const like = async (req, res) => {
  await likeVideo(req.user.id, req.params.videoId);
  res.json({ message: 'Liked' });
};

export const unlike = async (req, res) => {
  await unlikeVideo(req.user.id, req.params.videoId);
  res.json({ message: 'Unliked' });
};
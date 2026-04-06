import { likeVideo, unlikeVideo, getLikesCount, hasUserLiked } from '../services/like.service.js';

export const like = async (req, res) => {
  await likeVideo(req.user.id, req.params.videoId);
  res.json({ message: 'Liked' });
};

export const unlike = async (req, res) => {
  await unlikeVideo(req.user.id, req.params.videoId);
  res.json({ message: 'Unliked' });
};

//BACKEND (LIKE SYSTEM)

export const getLikes = async (req, res) => {
  const count = await getLikesCount(req.params.videoId);

  let liked = false;
  if (req.user) {
    liked = await hasUserLiked(req.user.id, req.params.videoId);
  }

  res.json({ count, liked });
};

import { addComment, getCommentsWithUser } from '../services/comment.service.js';

export const createComment = async (req, res) => {
  const id = await addComment({
    user_id: req.user.id,
    video_id: req.params.videoId,
    content: req.body.content
  });
  res.json({ id });
};

export const fetchComments = async (req, res) => {
  const comments = await getCommentsWithUser(req.params.videoId);
  res.json(comments);
};

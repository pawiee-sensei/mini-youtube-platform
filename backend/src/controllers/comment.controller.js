import {
  addComment,
  findCommentById,
  getCommentsWithUser,
  removeCommentReaction,
  setCommentReaction
} from '../services/comment.service.js';

export const createComment = async (req, res) => {
  const id = await addComment({
    user_id: req.user.id,
    video_id: req.params.videoId,
    content: req.body.content
  });
  res.json({ id });
};

export const fetchComments = async (req, res) => {
  const comments = await getCommentsWithUser(req.params.videoId, req.user?.id ?? null);
  res.json(comments);
};

export const reactToComment = async (req, res) => {
  const { reaction } = req.body;

  if (!['like', 'dislike'].includes(reaction)) {
    return res.status(400).json({ error: 'Reaction must be like or dislike' });
  }

  const comment = await findCommentById(req.params.commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  await setCommentReaction({
    userId: req.user.id,
    commentId: req.params.commentId,
    reaction
  });

  const comments = await getCommentsWithUser(comment.video_id, req.user.id);
  const updatedComment = comments.find((item) => String(item.id) === String(req.params.commentId));

  res.json(updatedComment);
};

export const clearCommentReaction = async (req, res) => {
  const comment = await findCommentById(req.params.commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  await removeCommentReaction({
    userId: req.user.id,
    commentId: req.params.commentId
  });

  const comments = await getCommentsWithUser(comment.video_id, req.user.id);
  const updatedComment = comments.find((item) => String(item.id) === String(req.params.commentId));

  res.json(updatedComment);
};

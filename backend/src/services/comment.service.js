import pool from '../config/db.js';

export const addComment = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO comments (user_id, video_id, content) VALUES (?, ?, ?)',
    [data.user_id, data.video_id, data.content]
  );
  return result.insertId;
};

export const getCommentsByVideo = async (video_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM comments WHERE video_id = ? ORDER BY created_at DESC',
    [video_id]
  );
  return rows;
};
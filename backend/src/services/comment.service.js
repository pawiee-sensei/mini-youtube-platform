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

//BACKEND (COMMENT SYSTEM)

export const getCommentsWithUser = async (video_id) => {
  const [rows] = await pool.query(
    `SELECT comments.*, users.username 
     FROM comments 
     JOIN users ON comments.user_id = users.id
     WHERE video_id = ?
     ORDER BY created_at DESC`,
    [video_id]
  );
  return rows;
};
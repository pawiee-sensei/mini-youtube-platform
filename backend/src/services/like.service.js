import pool from '../config/db.js';

export const likeVideo = async (user_id, video_id) => {
  await pool.query(
    'INSERT IGNORE INTO likes (user_id, video_id) VALUES (?, ?)',
    [user_id, video_id]
  );
};

export const unlikeVideo = async (user_id, video_id) => {
  await pool.query(
    'DELETE FROM likes WHERE user_id = ? AND video_id = ?',
    [user_id, video_id]
  );
};

export const getLikesCount = async (video_id) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM likes WHERE video_id = ?',
    [video_id]
  );
  return rows[0].count;
};

export const hasUserLiked = async (user_id, video_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM likes WHERE user_id = ? AND video_id = ?',
    [user_id, video_id]
  );
  return rows.length > 0;
};
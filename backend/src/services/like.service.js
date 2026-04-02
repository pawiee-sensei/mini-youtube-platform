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
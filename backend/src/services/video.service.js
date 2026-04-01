import pool from '../config/db.js';

export const createVideo = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO videos (user_id, title, description, video_url, thumbnail_url) VALUES (?, ?, ?, ?, ?)',
    [data.user_id, data.title, data.description, data.video_url, data.thumbnail_url]
  );
  return result.insertId;
};

export const getAllVideos = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM videos ORDER BY created_at DESC'
  );
  return rows;
};

export const getVideoById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM videos WHERE id = ?',
    [id]
  );
  return rows[0];
};
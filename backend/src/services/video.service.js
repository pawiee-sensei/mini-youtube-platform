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
    `SELECT
      videos.*,
      users.username AS uploader_username
    FROM videos
    LEFT JOIN users ON users.id = videos.user_id
    ORDER BY videos.created_at DESC`
  );
  return rows;
};

export const getVideoById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      videos.*,
      users.username AS uploader_username
    FROM videos
    LEFT JOIN users ON users.id = videos.user_id
    WHERE videos.id = ?`,
    [id]
  );
  return rows[0];
};

export const getVideosByUser = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT
      videos.*,
      users.username AS uploader_username
    FROM videos
    LEFT JOIN users ON users.id = videos.user_id
    WHERE videos.user_id = ?
    ORDER BY videos.created_at DESC`,
    [user_id]
  );
  return rows;
};

export const incrementVideoViews = async (id) => {
  const [result] = await pool.query(
    'UPDATE videos SET views = COALESCE(views, 0) + 1 WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};

export const deleteVideoById = async (videoId, userId) => {
  const [result] = await pool.query(
    'DELETE FROM videos WHERE id = ? AND user_id = ?',
    [videoId, userId]
  );

  return result.affectedRows;
};

export const updateVideoById = async (videoId, userId, data) => {
  const [result] = await pool.query(
    'UPDATE videos SET title = ?, description = ? WHERE id = ? AND user_id = ?',
    [data.title, data.description, videoId, userId]
  );

  return result.affectedRows;
};

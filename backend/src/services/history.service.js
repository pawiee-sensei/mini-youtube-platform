import pool from '../config/db.js';

export const ensureWatchHistoryTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS watch_history (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      video_id INT NOT NULL,
      progress_seconds DECIMAL(10, 2) NOT NULL DEFAULT 0,
      duration_seconds DECIMAL(10, 2) NOT NULL DEFAULT 0,
      last_watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_video (user_id, video_id),
      CONSTRAINT fk_watch_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_watch_history_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
    )
  `);
};

export const upsertWatchHistory = async ({ userId, videoId, progressSeconds, durationSeconds }) => {
  const safeProgress = Number.isFinite(progressSeconds) ? Math.max(0, progressSeconds) : 0;
  const safeDuration = Number.isFinite(durationSeconds) ? Math.max(0, durationSeconds) : 0;

  await pool.query(
    `
      INSERT INTO watch_history (user_id, video_id, progress_seconds, duration_seconds)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        progress_seconds = VALUES(progress_seconds),
        duration_seconds = VALUES(duration_seconds),
        last_watched_at = CURRENT_TIMESTAMP
    `,
    [userId, videoId, safeProgress, safeDuration]
  );
};

export const getWatchHistoryByUser = async (userId) => {
  const [rows] = await pool.query(
    `
      SELECT
        wh.video_id,
        wh.progress_seconds,
        wh.duration_seconds,
        wh.last_watched_at,
        v.title,
        v.description,
        v.thumbnail_url,
        v.views,
        v.user_id,
        u.username AS uploader_username
      FROM watch_history wh
      JOIN videos v ON v.id = wh.video_id
      LEFT JOIN users u ON u.id = v.user_id
      WHERE wh.user_id = ?
      ORDER BY wh.last_watched_at DESC
    `,
    [userId]
  );

  return rows;
};

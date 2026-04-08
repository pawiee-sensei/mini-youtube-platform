import pool from '../config/db.js';

export const ensureCommentRepliesSchema = async () => {
  const [columns] = await pool.query(
    `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'comments'
        AND COLUMN_NAME = 'parent_comment_id'
    `
  );

  if (!columns[0]?.count) {
    await pool.query(
      'ALTER TABLE comments ADD COLUMN parent_comment_id INT NULL AFTER video_id'
    );
  }
};

export const ensureCommentReactionsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comment_reactions (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      comment_id INT NOT NULL,
      reaction ENUM('like', 'dislike') NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_comment_reaction (user_id, comment_id),
      CONSTRAINT fk_comment_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_comment_reactions_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
    )
  `);
};

export const addComment = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO comments (user_id, video_id, parent_comment_id, content) VALUES (?, ?, ?, ?)',
    [data.user_id, data.video_id, data.parent_comment_id ?? null, data.content]
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

export const setCommentReaction = async ({ userId, commentId, reaction }) => {
  await pool.query(
    `
      INSERT INTO comment_reactions (user_id, comment_id, reaction)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE reaction = VALUES(reaction)
    `,
    [userId, commentId, reaction]
  );
};

export const removeCommentReaction = async ({ userId, commentId }) => {
  await pool.query(
    'DELETE FROM comment_reactions WHERE user_id = ? AND comment_id = ?',
    [userId, commentId]
  );
};

export const findCommentById = async (commentId) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, video_id, parent_comment_id, content, created_at FROM comments WHERE id = ?',
    [commentId]
  );

  return rows[0];
};

export const getCommentsWithUser = async (videoId, userId = null) => {
  const [rows] = await pool.query(
    `
      SELECT
        comments.*,
        users.username,
        users.avatar,
        (
          SELECT COUNT(*)
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.id
            AND comment_reactions.reaction = 'like'
        ) AS likesCount,
        (
          SELECT COUNT(*)
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.id
            AND comment_reactions.reaction = 'dislike'
        ) AS dislikesCount,
        (
          SELECT reaction
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.id
            AND comment_reactions.user_id = ?
          LIMIT 1
        ) AS userReaction
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.video_id = ?
      ORDER BY comments.parent_comment_id IS NOT NULL, comments.created_at DESC
    `,
    [userId, videoId]
  );

  return rows;
};

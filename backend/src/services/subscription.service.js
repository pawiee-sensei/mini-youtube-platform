import pool from '../config/db.js';

export const subscribe = async (subscriberId, channelId) => {
  await pool.query(
    'INSERT IGNORE INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)',
    [subscriberId, channelId]
  );
};

export const unsubscribe = async (subscriberId, channelId) => {
  await pool.query(
    'DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?',
    [subscriberId, channelId]
  );
};

export const getSubscriberCount = async (channelId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM subscriptions WHERE channel_id = ?',
    [channelId]
  );

  return rows[0].count;
};

export const isSubscribed = async (subscriberId, channelId) => {
  const [rows] = await pool.query(
    'SELECT 1 FROM subscriptions WHERE subscriber_id = ? AND channel_id = ? LIMIT 1',
    [subscriberId, channelId]
  );

  return rows.length > 0;
};

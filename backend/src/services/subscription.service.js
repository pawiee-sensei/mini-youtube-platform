import pool from '../config/db.js';

export const subscribe = async (subscriber_id, channel_id) => {
  await pool.query(
    'INSERT IGNORE INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)',
    [subscriber_id, channel_id]
  );
};

export const unsubscribe = async (subscriber_id, channel_id) => {
  await pool.query(
    'DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?',
    [subscriber_id, channel_id]
  );
};

export const getSubscriberCount = async (channel_id) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM subscriptions WHERE channel_id = ?',
    [channel_id]
  );
  return rows[0].count;
};

export const isSubscribed = async (subscriber_id, channel_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?',
    [subscriber_id, channel_id]
  );
  return rows.length > 0;
};
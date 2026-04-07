import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUser = async ({ username, email, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, role || 'user']
  );

  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, username, email, role, avatar, banner FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const updateUserImages = async ({ id, avatar, banner }) => {
  const fields = [];
  const values = [];

  if (avatar !== undefined) {
    fields.push('avatar = ?');
    values.push(avatar);
  }

  if (banner !== undefined) {
    fields.push('banner = ?');
    values.push(banner);
  }

  if (!fields.length) return 0;

  values.push(id);

  const [result] = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return result.affectedRows;
};

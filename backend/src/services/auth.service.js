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
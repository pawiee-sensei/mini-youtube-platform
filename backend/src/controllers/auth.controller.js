import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../services/auth.service.js';

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        field: 'email',
        message: 'Email already in use'
      });
    }

    const userId = await createUser({ username, email, password, role });

    res.json({ message: 'User created', userId });

  } catch (err) {
    res.status(500).json({
      message: 'Registration failed'
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await findUserByEmail(req.body.email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

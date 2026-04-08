import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserImages
} from '../services/auth.service.js';

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        field: 'email',
        message: 'Email already in use'
      });
    }

    const userId = await createUser({ username, email, password });

    res.json({ message: 'User created', userId });

  } catch (err) {
    res.status(500).json({
      message: 'Registration failed'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const invalidCredentialsResponse = { error: 'Invalid credentials' };

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT secret is not configured' });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json(invalidCredentialsResponse);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json(invalidCredentialsResponse);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        banner: user.banner
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
        role: user.role,
        avatar: user.avatar,
        banner: user.banner
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        banner: user.banner
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfileImages = async (req, res) => {
  try {
    const avatarFile = req.files?.avatar?.[0];
    const bannerFile = req.files?.banner?.[0];

    if (!avatarFile && !bannerFile) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    await updateUserImages({
      id: req.user.id,
      avatar: avatarFile ? `/uploads/avatars/${avatarFile.filename}` : undefined,
      banner: bannerFile ? `/uploads/banners/${bannerFile.filename}` : undefined
    });

    const user = await findUserById(req.user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        banner: user.banner
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

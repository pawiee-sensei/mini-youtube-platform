import jwt from 'jsonwebtoken';

const extractToken = (authHeader) => {
  if (!authHeader) return null;

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  return token || null;
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: 'No token' });

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT secret is not configured' });
  }

  const token = extractToken(authHeader);

  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !process.env.JWT_SECRET) {
    return next();
  }

  const token = extractToken(authHeader);

  if (!token) {
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();
};

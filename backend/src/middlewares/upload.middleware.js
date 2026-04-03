import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure folders exist
const videoDir = 'uploads/videos';
const thumbDir = 'uploads/thumbnails';

[videoDir, thumbDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, videoDir);
    } else {
      cb(null, thumbDir);
    }
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });
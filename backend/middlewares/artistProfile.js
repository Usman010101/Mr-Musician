import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/artistProfiles');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed!'), false);
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const cleanupOnError = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400 && req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error cleaning up file:', err);
      });
    }
  });
  next();
};
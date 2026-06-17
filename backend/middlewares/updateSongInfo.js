import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// ES Modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for song image updates
const songImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/songs");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, "image-" + uniqueSuffix + "-" + sanitizedFilename);
  },
});

export const songImageUpload = multer({ 
  storage: songImageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, PNG, and WEBP images are allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single("image"); // Note: Using .single() instead of .fields() since we're only handling images
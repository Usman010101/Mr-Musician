import multer from "multer";
import path from "path";
import fs from "fs";

// Helper function to ensure the directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Set storage configuration for both song and image files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("public", "songs"); // Single directory for all uploads
    ensureDirectoryExists(uploadPath); // Ensure the 'public/songs' directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Create multer upload middleware to handle both files
export const uploadFiles = multer({
  storage,
}).fields([
  { name: "song", maxCount: 1 }, // 'song' is the form field name for the song file
  { name: "image", maxCount: 1 }, // 'image' is the form field name for the image file
]);

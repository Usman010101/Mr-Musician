import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Explicitly accept only 'audio' field
    if (file.fieldname === 'audio') {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
    }
  }
});

export default upload;
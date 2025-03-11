import express from 'express';
import { uploadSong } from '../controllers/uploadSongController.js';
import {uploadFiles} from '../middlewares/uploadSongs.js'
import {verifyToken} from '../middlewares/auth.js';

const router = express.Router();

// Route for uploading both song and image in one request
router.post('/song/:artistId',uploadFiles, uploadSong);

export default router;
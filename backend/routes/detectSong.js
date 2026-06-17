// router.js
import express from 'express';
import { detectSong } from '../controllers/detectSong.js'; 
import upload from '../middlewares/detectSong.js'

const router = express.Router();

// Detection endpoint
router.post('/song', upload.single('audio'), detectSong);

export default router;  
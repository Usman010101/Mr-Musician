import express from 'express';
import {verifyToken} from '../middlewares/auth.js';
import { deleteSong,updateSong } from '../controllers/getSongs.js';
import { songImageUpload } from '../middlewares/updateSongInfo.js';

const router = express.Router();
router.use(verifyToken)
// api/updateSongs/info/:songid
router.post('/info/:songid',songImageUpload,updateSong);

// api/updateSongs/deleteSong/:songId
router.post('/deleteSong/:songId',deleteSong);



export default router;
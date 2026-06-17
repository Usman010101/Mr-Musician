import express from 'express';
import {verifyToken} from '../middlewares/auth.js';
import { getListenerHomeData,getPaginatedSongs, getAlbumWithSongs,getArtistById } from '../controllers/Listener.js';

const router = express.Router();

// /api/listeners/getallInfo
router.get('/getallInfo',getListenerHomeData);

// /api/listeners/getpaginaatedSongs
router.get('/getpaginaatedSongs',getPaginatedSongs)


// api/listeners/album/:albumId
router.get('/album/:albumId',getAlbumWithSongs)


// api/listeners/artist/:artistId
router.get('/artist/:artistId',getArtistById)



export default router;
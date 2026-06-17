import express from "express";
import {verifyToken} from '../middlewares/auth.js';
import { deleteAlbum, getAlbums, updateAlbum } from "../controllers/artistAlbums.js";
import {albumUpload} from "../middlewares/albums.js";
import { createAlbum } from "../controllers/artistAlbums.js";


const router = express.Router();
router.use(verifyToken)

// api/albums/getAlbums
router.get('/getAlbums',getAlbums)


//api/albums/addAlbum
router.post('/addAlbum', albumUpload.single("coverImage"), createAlbum);



// api/albums/deleteAlbum/:albumId
router.post('/deleteAlbum/:albumId', deleteAlbum)



// api/albums/updateAlbum/:albumId
router.post('/updateAlbum/:albumId', albumUpload.single("coverImage"), updateAlbum);










export default router;

import express from "express";
import { getArtistProfile } from "../controllers/artistInfo.js";
import { getArtistProfileData } from "../controllers/artistInfoProfile.js";
import {verifyToken} from '../middlewares/auth.js';

const router = express.Router();

// TO get te artist information
// router.get("/:artistId",getArtistProfile); // for user


// /api/artist/getArtistProfile
router.get("/getArtistProfile",verifyToken,getArtistProfileData) //for artist

// to set the artist information




export default router;

import express from "express";
import { streamSong } from "../controllers/playsong.js"; // Adjust path as needed

const router = express.Router();


router.get("/:songId", streamSong);

export default router;

import { Song } from "../models/Songs.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

export const uploadSong = async (req, res) => {
  let songFile, imageFile;
  
  try {
    console.log("Hllo");
    const { artistId } = req.params;
    const { title, genre } = req.body;
    songFile = req.files?.song?.[0];
    imageFile = req.files?.image?.[0];

    // Validate inputs
    if (!artistId || !title || !songFile || !imageFile) {
      return res.status(400).json({ message: "Artist ID, title, and files are required." });
    }

    // Step 1: Send song to Python fingerprint service
    const form = new FormData();
    form.append("file", fs.createReadStream(songFile.path), {
      filename: songFile.originalname,
      contentType: songFile.mimetype,
    });

    // Call Python service
    const response = await axios.post("http://localhost:8080/fingerprint", form, {
      headers: form.getHeaders(),
    });

    console.log("Response", response.data);

    if (!response.data.fingerprint) {
      throw new Error("Fingerprint generation failed");
    }

    // Step 2: Save song to MongoDB with fingerprint
    const newSong = new Song({
      title,
      genre,
      artistId,
      fileUrl: `/Songs/${songFile.filename}`, // Path for frontend access
      imageUrl: `/Songs/${imageFile.filename}`,
      fingerprint: response.data.fingerprint,
    });

    await newSong.save();

    res.status(201).json({ message: "Song uploaded with fingerprint!", song: newSong });

  } catch (err) {
    // Cleanup uploaded files on error
    if (songFile?.path) fs.unlinkSync(songFile.path);
    if (imageFile?.path) fs.unlinkSync(imageFile.path);
    
    res.status(500).json({ 
      message: "Error uploading song", 
      error: err.message 
    });
  }
};
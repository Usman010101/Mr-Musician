import { Song } from "../models/Songs.js";
import { Album } from "../models/Songs.js"; // Import the Album model
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = {
  info: (msg) => console.log(`[NODE][INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[NODE][ERROR] ${new Date().toISOString()} - ${msg}`)
};

export const uploadSong = async (req, res) => {
  let songFile, imageFile, newSong;
  const startTime = Date.now();

  try {
    logger.info('Starting upload process');
    const artistId = req.artistId; // Retrieved from middleware or JWT
    const albumId = req.params.albumId || req.body.albumId; // Retrieve albumId
    console.log(`Artist ID: ${artistId}, Album ID: ${albumId}`);
    const { title, genre } = req.body;
    songFile = req.files?.song?.[0];
    imageFile = req.files?.image?.[0];

    if (!artistId || !albumId || !title || !songFile || !imageFile) {
      logger.error('Missing required fields');
      return res.status(400).json({ message: "All fields, including albumId, are required" });
    }

    // Check if album exists
    const album = await Album.findById(albumId);
    if (!album) {
      logger.error(`Album not found: ${albumId}`);
      return res.status(404).json({ message: "Album not found" });
    }

    logger.info('Creating initial song document');
    newSong = new Song({
      title,
      genre,
      artistId,
      albumId,
      fileUrl: `/songs/${songFile.filename}`,
      imageUrl: `/songs/${imageFile.filename}`,
      processing_status: 'processing'
    });
    await newSong.save();
    logger.info(`Song document created: ${newSong._id}`);

    // Add song to album
    album.songs.push(newSong._id);
    await album.save();
    logger.info(`Song added to album: ${albumId}`);

    // Prepare form data for Python processing
    const form = new FormData();
    form.append("song", fs.createReadStream(songFile.path), {
      filename: songFile.originalname,
      contentType: songFile.mimetype,
    });

    logger.info(`Sending to Python service: ${newSong._id}`);
    const pythonResponse = await axios.post(
      'http://localhost:8080/process',  // Python service endpoint
      form,
      {
        headers: form.getHeaders(),
        timeout: 120000
      }
    );
    logger.info(`Python response received`);

    if (!pythonResponse.data.success) {
      throw new Error(`Python processing failed: ${pythonResponse.data.error}`);
    }

    // Update song with fingerprints and processing status
    const updatedSong = await Song.findByIdAndUpdate(
      newSong._id,
      {
        $set: {
          fingerprints: pythonResponse.data.fingerprints.map(fp => ({
            hash: fp.hash,
            bins: fp.bins,
            delta: fp.delta,
            time: fp.time
          })),
          duration: pythonResponse.data.duration,
          processing_status: 'completed'
        }
      },
      { new: true, lean: true }
    );

    if (!updatedSong) {
      throw new Error('Failed to update song document');
    }

    logger.info(`Upload completed in ${Date.now() - startTime}ms`);
    res.status(201).json({
      message: "Song uploaded successfully!",
      song: updatedSong,
      albumId,
      hash_count: pythonResponse.data.hash_count,
      duration: pythonResponse.data.duration
    });

  } catch (err) {
    logger.error(`Upload failed: ${err.message}`);

    // Cleanup
    try {
      if (newSong) {
        await Song.findByIdAndUpdate(
          newSong._id,
          { $set: { processing_status: 'failed' } }
        );
        logger.info(`Marked song document ${newSong._id} as failed`);
      }
      if (songFile?.path) fs.unlinkSync(songFile.path);
      if (imageFile?.path) fs.unlinkSync(imageFile.path);
    } catch (cleanupErr) {
      logger.error(`Cleanup failed: ${cleanupErr.message}`);
    }

    res.status(500).json({
      message: "Upload failed",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

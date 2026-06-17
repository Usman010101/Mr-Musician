import { Song, Album } from "../models/Songs.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const deleteSong = async (req, res) => {
  console.log("Deleting song...");
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { songId } = req.params;
    const artistId = req.artistId;
    console.log("Song ID:", songId);

    // Validate required fields
    if (!songId || !artistId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the song with album information
    const song = await Song.findOne({ _id: songId, artistId }).session(session);
    
    if (!song) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Song not found or unauthorized" });
    }

    // Store album ID before deletion
    const albumId = song.albumId;

    // Delete associated files
    const deleteFile = (filePath) => {
      if (filePath) {
        const fullPath = path.join(__dirname, '..', 'public', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted file: ${fullPath}`);
        }
      }
    };

    // Delete both song and image files
    deleteFile(song.fileUrl);
    deleteFile(song.imageUrl);

    // Remove song from album's songs array
    await Album.findByIdAndUpdate(
      albumId,
      { $pull: { songs: songId } },
      { session }
    );

    // Delete the song document
    await Song.findByIdAndDelete(songId).session(session);

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json({ 
      success: true,
      message: "Song deleted successfully",
      deletedSongId: songId,
      albumId: albumId
    });

  } catch (err) {
    // Abort transaction on error
    await session.abortTransaction();
    
    console.error("Error deleting song:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting song", 
      error: err.message 
    });
  } finally {
    session.endSession();
  }
};


export const updateSong = async (req, res) => {
  try {
    const { songId } = req.params;
    const artistId = req.artistId;
    const { title, genre } = req.body;
    const newImageFile = req.files?.image?.[0]; // Using your multer config

    // Validate required fields
    if (!songId || !artistId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the song
    const song = await Song.findOne({ _id: songId, artistId });
    
    if (!song) {
      return res.status(404).json({ message: "Song not found or unauthorized" });
    }

    // Prepare update object
    const updateData = {};
    if (title) updateData.title = title;
    if (genre) updateData.genre = genre;

    // Handle image update if new image is provided
    if (newImageFile) {
      // Delete old image file if it exists
      if (song.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', 'public', song.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save new image path (matches your multer config)
      updateData.imageUrl = `songs/${newImageFile.filename}`;
    }

    // Update the song in database
    const updatedSong = await Song.findByIdAndUpdate(
      songId,
      updateData,
      { new: true }
    ).select('title genre fileUrl imageUrl albumId');

    res.status(200).json({ 
      success: true,
      message: "Song updated successfully", 
      song: updatedSong 
    });

  } catch (err) {
    console.error("Error updating song:", err);
    res.status(500).json({ 
      success: false,
      message: "Error updating song", 
      error: err.message 
    });
  }
};
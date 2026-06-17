import {Album} from '../models/Songs.js';
import { Song } from '../models/Songs.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const  getAlbums = async (req, res) => {
    try {
      console.log("Fetching albums for the artist ....");
      const artistId = req.artistId; 
      if (!artistId) {
        return res.status(400).json({ message: "Artist ID is required." });
      }
  
      // Fetch albums for the artist and populate songs
      const albums = await Album.find({ artistId })
      .populate('songs', 'title fileUrl imageUrl duration')
      .lean();
  
      res.status(200).json({ albums });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  export const createAlbum = async (req, res) => {
    try {
      console.log("Creating a new album for the artist...");
      const artistId = req.artistId; // Retrieved from middleware or JWT
      const { title } = req.body;
      const coverImageFile = req.file; // Access uploaded file
  
      // Validate required fields
      if (!artistId || !title) {
        return res.status(400).json({ message: "Artist ID and title are required." });
      }
  
      // Handle the uploaded file
      let coverImageUrl = null;
      if (coverImageFile) {
        coverImageUrl = `/albums/${coverImageFile.filename}`;
      } else {
        return res.status(400).json({ message: "Cover image file is required." });
      }
  
      // Create the new album
      const newAlbum = new Album({
        title,
        artistId,
        coverImageUrl
      });
  
      // Save the album to the database
      const savedAlbum = await newAlbum.save();
      console.log(`New album created with ID: ${savedAlbum._id}`);
  
      res.status(201).json({
        message: "Album created successfully!",
        album: savedAlbum,
      });
    } catch (err) {
      console.error("Error creating album:", err.message);
      res.status(500).json({ message: "Failed to create album", error: err.message });
    }
  };
  

// Update Album endpoint
export const updateAlbum = async (req, res) => {
  try {
    console.log("Updating album...");
    const artistId = req.artistId; // Retrieved from middleware
    const { albumId, title } = req.body;
    const coverImageFile = req.file; // Access uploaded file if any

    // Validate required fields
    if (!artistId || !albumId) {
      return res.status(400).json({ message: "Artist ID and Album ID are required." });
    }

    // Find the album to update
    const album = await Album.findOne({ _id: albumId, artistId });
    if (!album) {
      return res.status(404).json({ message: "Album not found or you don't have permission to update it." });
    }

    // Update fields if provided
    if (title) {
      album.title = title;
    }

    // Handle the uploaded file if provided
    if (coverImageFile) {
      // Delete old cover image if it exists
      if (album.coverImageUrl) {
        const oldImagePath = path.join(__dirname, '../public', album.coverImageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      album.coverImageUrl = `/albums/${coverImageFile.filename}`;
    }

    // Save the updated album
    const updatedAlbum = await album.save();
    console.log(`Album updated with ID: ${updatedAlbum._id}`);

    res.status(200).json({
      message: "Album updated successfully!",
      album: updatedAlbum,
    });
  } catch (err) {
    console.error("Error updating album:", err.message);
    res.status(500).json({ message: "Failed to update album", error: err.message });
  }
};



export const deleteAlbum = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const artistId = req.artistId;
    const { albumId } = req.params;

    if (!artistId || !albumId) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: "Artist ID and Album ID are required.",
        success: false
      });
    }

    // 1. Find the album first
    const album = await Album.findOne({ _id: albumId, artistId }).session(session);
    if (!album) {
      await session.abortTransaction();
      return res.status(404).json({ 
        message: "Album not found or no permission",
        success: false
      });
    }

    // 2. Find all songs in the album
    const songs = await Song.find({ albumId, artistId }).session(session);

    // 3. Delete all song files and images
    const deleteFile = (filePath) => {
      if (!filePath) return;
      
      try {
        const fullPath = path.join(__dirname, '..', 'public', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted file: ${fullPath}`);
        }
      } catch (fileError) {
        console.error(`Error deleting file ${filePath}:`, fileError);
      }
    };

    // Delete all song files
    for (const song of songs) {
      deleteFile(song.fileUrl);  // Delete audio file
      deleteFile(song.imageUrl); // Delete cover image
    }

    // 4. Delete all songs from database
    await Song.deleteMany({ albumId, artistId }).session(session);

    // 5. Delete album cover image
    if (album.coverImageUrl) {
      deleteFile(album.coverImageUrl);
    }

    // 6. Delete the album document
    await Album.findByIdAndDelete(albumId).session(session);

    // 7. Commit the transaction
    await session.commitTransaction();

    return res.status(200).json({ 
      message: "Album and all associated songs/files deleted successfully",
      success: true,
      deletedAlbumId: albumId,
      deletedSongsCount: songs.length
    });

  } catch (err) {
    await session.abortTransaction();
    console.error("Album deletion error:", err);
    return res.status(500).json({ 
      message: err.message || "Album deletion failed",
      success: false 
    });
  } finally {
    session.endSession();
  }
};
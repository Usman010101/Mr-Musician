import { Artist } from "../models/userModels.js";
import { Song } from "../models/Songs.js";
import mongoose from "mongoose";
export const getArtistProfileData = async (req, res) => {
    console.log("Fetching artist Profile data for Artist");
  try {
    if (!req.artistId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }
    const artistId = new mongoose.Types.ObjectId(req.artistId);
    // Fetch artist data (excluding sensitive fields)
    const artist = await Artist.findById(artistId)
      .select('-password -paymentAccount -__v')
      .lean();

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Fetch all songs by this artist (excluding fingerprints)
    const songs = await Song.find({ artistId: req.artistId })
      .select('-fingerprints -__v')
      .sort({ uploadDate: -1 }) // Newest first
      .lean();

    // Calculate total stats
    const totalStats = {
      songs: songs.length,
      views: songs.reduce((sum, song) => sum + (song.views || 0), 0),
      likes: songs.reduce((sum, song) => sum + (song.likes || 0), 0)
    };

    const normalizedProfileImage = artist.profileImage
    ? artist.profileImage.replace(/\\/g, '/')
    : null;

    const profileImageUrl = normalizedProfileImage
    ? `http://localhost:5000/${normalizedProfileImage}`
    : null;

    // Structure the response
    const response = {
      success: true,
      artist: {
        basicInfo: {
          name: artist.name,
          recognizedAs: artist.recognizedAs,
          email: artist.email,
          phoneNo: artist.phoneNo,
          profileImage: profileImageUrl,
          bio: artist.bio,
          createdAt: artist.createdAt,
          updatedAt: artist.updatedAt
        },
        paymentSettings: {
          payoutEmail: artist.paymentEmail,
          autoPayout: artist.autoPayout || false
        },
        revenue: {
          monthly: artist.monthlyRevenue || [],
          yearly: artist.yearlyRevenue || []
        },
        stats: totalStats
      },
      songs: songs.map(song => ({
        id: song._id,
        title: song.title,
        genre: song.genre,
        fileUrl: song.fileUrl,
        imageUrl: song.imageUrl,
        duration: song.duration,
        views: song.views,
        likes: song.likes,
        processing_status: song.processing_status,
        uploadDate: song.uploadDate
      }))
    };

    res.json(response);

  } catch (error) {
    console.error("Error fetching artist dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

import { Artist } from "../models/userModels.js";
import { Song } from "../models/Songs.js";

export const getArtistProfile = async (req, res) => {
  try {
    const { artistId } = req.params;

    // Fetch artist with payment and revenue data
    const artist = await Artist.findById(artistId)
      .select('-password -__v -createdAt -updatedAt') // Exclude sensitive/unneeded fields
      .lean();

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Fetch all songs with basic analytics
    const songs = await Song.find({ artistId })
      .select('-fingerprints -__v') // Exclude large binary data
      .sort({ uploadDate: -1 }) // Newest first
      .lean();

    // Calculate aggregated stats
    const totalStreams = songs.reduce((sum, song) => sum + song.views, 0);
    const totalLikes = songs.reduce((sum, song) => sum + song.likes, 0);
    const completedSongs = songs.filter(s => s.processing_status === 'completed').length;

    // Prepare the response
    const response = {
      artist: {
        _id: artist._id,
        name: artist.name,
        recognizedAs: artist.recognizedAs,
        profileImage: artist.profileImage,
        bio: artist.bio,
        contact: {
          email: artist.email,
          phoneNo: artist.phoneNo,
        },
        payment: {
          account: artist.paymentAccount ? '••••••••' + artist.paymentAccount.slice(-4) : null,
          notificationEmail: artist.paymentEmail,
        },
        revenue: {
          monthly: artist.monthlyRevenue || [],
          yearly: artist.yearlyRevenue || [],
        },
      },
      songs: songs.map(song => ({
        _id: song._id,
        title: song.title,
        genre: song.genre,
        duration: song.duration,
        coverArt: song.imageUrl,
        audioUrl: song.fileUrl,
        stats: {
          views: song.views,
          likes: song.likes,
        },
        status: song.processing_status,
        released: song.uploadDate,
      })),
      analytics: {
        totalSongs: songs.length,
        completedSongs,
        totalStreams,
        totalLikes,
        avgLikesPerSong: totalLikes / (songs.length || 1), // Prevent division by zero
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

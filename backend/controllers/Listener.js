import { Artist } from "../models/userModels.js";
import { Song } from "../models/Songs.js";
import { Album } from "../models/Songs.js";

export const getListenerHomeData = async (req, res) => {
  try {
    // 1. Fetch all artists (excluding sensitive data)
    const artists = await Artist.find({})
      .select('-password -paymentAccount -paymentEmail -monthlyRevenue -yearlyRevenue')
      .lean();

    // 2. Fetch all albums grouped by artist
    const albumsByArtist = await Album.aggregate([
      {
        $group: {
          _id: "$artistId",
          albums: { $push: "$$ROOT" }
        }
      }
    ]);

    // 3. Fetch all songs grouped by album
    const songsByAlbum = await Song.aggregate([
      {
        $group: {
          _id: "$albumId",
          songs: { $push: "$$ROOT" }
        }
      }
    ]);

    // 4. Create a map for quick album lookup
    const albumMap = new Map();
    albumsByArtist.forEach(group => {
      albumMap.set(group._id.toString(), group.albums);
    });

    // 5. Create a map for quick song lookup
    const songMap = new Map();
    songsByAlbum.forEach(group => {
      songMap.set(group._id.toString(), group.songs);
    });

    // 6. Build the hierarchical response
    const structuredData = artists.map(artist => {
      const artistAlbums = albumMap.get(artist._id.toString()) || [];
      
      const albumsWithSongs = artistAlbums.map(album => {
        const albumSongs = songMap.get(album._id.toString()) || [];
        
        return {
          id: album._id,
          title: album.title,
          coverImageUrl: album.coverImageUrl,
          releaseDate: album.releaseDate,
          songs: albumSongs.map(song => ({
            id: song._id,
            title: song.title,
            fileUrl: song.fileUrl,
            imageUrl: song.imageUrl,
            duration: song.duration,
            views: song.views,
            likes: song.likes,
            genre: song.genre
          }))
        };
      });

      return {
        id: artist._id,
        name: artist.name,
        profileImage: artist.profileImage,
        recognizedAs: artist.recognizedAs,
        albums: albumsWithSongs
      };
    });

    res.status(200).json({
      success: true,
      data: structuredData
    });

  } catch (error) {
    console.error('Error fetching listener home data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home data',
      error: error.message
    });
  }
};


export const getPaginatedSongs = async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch songs with pagination
    const songs = await Song.find({})
      .skip(skip)
      .limit(limit)
      .populate('artistId', 'name profileImage')
      .populate('albumId', 'title coverImageUrl')
      .lean();

    // Get total count for pagination info
    const totalSongs = await Song.countDocuments();
    const totalPages = Math.ceil(totalSongs / limit);

    // Format response
    const formattedSongs = songs.map(song => ({
      id: song._id,
      title: song.title,
      fileUrl: song.fileUrl,
      imageUrl: song.imageUrl,
      duration: song.duration,
      views: song.views,
      likes: song.likes,
      genre: song.genre,
      artist: {
        id: song.artistId?._id,
        name: song.artistId?.name || 'Unknown Artist',
        profileImage: song.artistId?.profileImage
      },
      album: {
        id: song.albumId?._id,
        title: song.albumId?.title || 'Single',
        coverImageUrl: song.albumId?.coverImageUrl
      }
    }));

    res.status(200).json({
      success: true,
      data: formattedSongs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalSongs,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching paginated songs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch songs',
      error: error.message
    });
  }
};



export const getAlbumWithSongs = async (req, res) => {
  console.log("Fetching album with songs for ID:", req.params.albumId);
  try {
    const albumId = req.params.albumId;

    // 1. Find the album
    const album = await Album.findById(albumId).lean();
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    // 2. Find all songs for this album
    const songs = await Song.find({ albumId: album._id })
      .select('title fileUrl imageUrl duration views likes genre')
      .lean();

    // 3. Format the response
    const response = {
      id: album._id,
      title: album.title,
      coverImageUrl: `http://localhost:5000/${album.coverImageUrl}`,
      releaseDate: album.releaseDate,
      songs: songs.map(song => ({
        id: song._id,
        title: song.title,
        fileUrl: `http://localhost:5000/${song.fileUrl}`,
        imageUrl: `http://localhost:5000/${song.imageUrl}`,
        duration: song.duration,
        plays: song.views,
        likes: song.likes,
        genre: song.genre
      }))
    };

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch album data',
      error: error.message
    });
  }
};



export const getArtistById = async (req, res) => {
  try {
    const artistId = req.params.artistId;

    // 1. Fetch the artist (excluding sensitive data)
    const artist = await Artist.findById(artistId)
      .select('-password -paymentAccount -paymentEmail -monthlyRevenue -yearlyRevenue')
      .lean();

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    // 2. Fetch all albums for this artist
    const albums = await Album.find({ artistId })
      .sort({ releaseDate: -1 })
      .lean();

    // 3. Fetch all songs for this artist
    const songs = await Song.find({ artistId })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Group songs by album
    const songsByAlbum = {};
    songs.forEach(song => {
      const albumId = song.albumId?.toString() || 'singles';
      if (!songsByAlbum[albumId]) {
        songsByAlbum[albumId] = [];
      }
      songsByAlbum[albumId].push(song);
    });

    // 5. Structure albums with their songs
    const structuredAlbums = albums.map(album => ({
      id: album._id,
      title: album.title,
      coverImageUrl: album.coverImageUrl,
      releaseDate: album.releaseDate,
      songs: songsByAlbum[album._id.toString()] || []
    }));

    // 6. Add singles (songs without album)
    const singles = songsByAlbum['singles'] || [];

    res.status(200).json({
      success: true,
      data: {
        artist: {
          id: artist._id,
          name: artist.name,
          profileImage: `http://localhost:5000/${artist.profileImage}`,
          recognizedAs: artist.recognizedAs,
          bio: artist.bio || '',
          stats: {
            views: artist.totalViews || 0,
            likes: artist.totalLikes || 0
          }
        },
        albums: structuredAlbums,
        singles
      }
    });

  } catch (error) {
    console.error('Error fetching artist data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artist data',
      error: error.message
    });
  }
};
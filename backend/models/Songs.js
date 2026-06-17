import mongoose from "mongoose";

// Song Schema
// models/Songs.js

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Artist", 
    required: true 
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Album",
    required:true
  },
  genre: { type: String },
  fileUrl: { type: String, required: true },
  imageUrl: { type: String },
  fingerprints: [{
    hash: { type: String, required: true },
    bins: { type: [Number], required: true }, // Added bins array
    delta: { type: Number, required: true },
    time: { type: Number, required: true },   // Changed from t1 to time
    _id: false
  }],
  duration: Number,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  processing_status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  uploadDate: { type: Date, default: Date.now }
}, {
  versionKey: false 
});


// Album Schema
const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
  releaseDate: { type: Date ,default: Date.now },
  coverImageUrl: { type: String }, // Optional: Album cover image
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }], // Array of song references
});

// Models
export const Song = mongoose.models.Song || mongoose.model("Song", songSchema);
export const Album = mongoose.models.Album || mongoose.model("Album", albumSchema);

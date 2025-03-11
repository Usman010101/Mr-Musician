import mongoose from "mongoose";

// Song Schema
// models/Songs.js


const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
  genre: { type: String },
  fileUrl: { type: String, required: true },
  imageUrl: { type: String },
  fingerprint: { type: Array, default: [] }, // [[time, frequency], ...]
  uploadDate: { type: Date, default: Date.now },
});



// Album Schema
const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
  releaseDate: { type: Date },
  coverImageUrl: { type: String }, // Optional: Album cover image
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }], // Array of song references
});

// Models
export const Song = mongoose.models.Song || mongoose.model("Song", songSchema);
export const Album = mongoose.models.Album || mongoose.model("Album", albumSchema);

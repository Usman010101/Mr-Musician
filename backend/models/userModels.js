import mongoose from "mongoose";

// Listener Schema
const ListenerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Artist Schema
const ArtistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    recognizedAs: {
      type: String,
      required: true, // Genre, style, etc.
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Admin Schema
const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export models for each schema
const Listener = mongoose.models.Listener || mongoose.model("Listener", ListenerSchema);
const Artist = mongoose.models.Artist || mongoose.model("Artist", ArtistSchema);
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export { Listener, Artist, Admin };

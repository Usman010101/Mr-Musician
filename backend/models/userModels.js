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



const ArtistSchema = new mongoose.Schema(
  {
    // Core Artist Information (your existing fields)
    name: {
      type: String,
      required: true,
    },
    recognizedAs: {
      type: String,
      required: true,
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
    profileImage: {
      type: String,
      default: "default_profile_image_url",
    },
    bio: {
      type: String,
      default: "This is a default bio.",
    },

    // Payment Information (simplified)
    paymentAccount: String,  // Can be PayPal email, bank account ID, etc.
    paymentEmail: String,    // For payment notifications
    autoPayout:Boolean, // Auto payout option

    // Revenue Tracking (minimal)
    monthlyRevenue: [{
      year: Number,   // 2023, 2024, etc.
      month: Number,  // 1-12 (January-December)
      amount: Number  // Total revenue in USD
    }],
    yearlyRevenue: [{
      year: Number,   // 2023, 2024, etc.
      amount: Number  // Total revenue in USD
    }]
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
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

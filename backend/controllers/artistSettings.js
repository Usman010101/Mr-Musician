import { Artist } from "../models/userModels.js";
import { Song } from "../models/Songs.js";
import bcrypt from 'bcryptjs';
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateProfile = async (req, res) => {
  console.log("Updating profile...");
  if (!req.artistId) return res.status(403).json({ message: "Artist access only" });

  try {
    const { name, bio } = req.body;
    const updates = { name, bio };

    if (req.file) {
      const artist = await Artist.findById(req.artistId);
      
      if (artist.profileImage && !artist.profileImage.includes('default-avatar')) {
        const oldImagePath = path.join(__dirname, '../public', artist.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, err => {
            if (err) console.error('Error deleting old image:', err);
          });
        }
      }
      
      updates.profileImage = path.join('artistProfiles', req.file.filename);
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      req.artistId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, artist: updatedArtist });

  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error cleaning up file:', err);
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};


// Change Password
export const changePassword = async (req, res) => {
  console.log("Changing password...");
  try {
    const { currentPassword, newPassword } = req.body;
    
    
    // 1. Find artist
    const artist = await Artist.findById(req.artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, artist.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // 3. Hash and save new password
    const salt = await bcrypt.genSalt(10);
    artist.password = await bcrypt.hash(newPassword, salt);
    await artist.save();

    // 4. Respond with success
    res.json({ 
      success: true,
      message: "Password updated successfully" 
    });

  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};



export const deleteAccount = async (req, res) => {
  try {
    // 1. Find artist and all their data
    const artist = await Artist.findById(req.artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // 2. Delete profile image if exists
    if (artist.profileImage && !artist.profileImage.includes('default-avatar')) {
      const imagePath = path.join(__dirname, '../public', artist.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 3. Delete all artist songs (example implementation)
    if (artist.songs && artist.songs.length > 0) {
      artist.songs.forEach(song => {
        const songPath = path.join(__dirname, '../public/songs', song.filename);
        if (fs.existsSync(songPath)) {
          fs.unlinkSync(songPath);
        }
      });
    }

    // 4. Delete from database
    await Artist.findByIdAndDelete(req.artistId);

    // 5. Clear all sessions (example using Redis)
    // await redisClient.del(`sess:${req.sessionID}`);

    // 6. Clear auth cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // 7. Respond with success
    res.json({ 
      success: true,
      message: "Account and all associated data deleted successfully" 
    });

  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const updatePaymentSettings = async (req, res) => {
  try {
    const { bankAccount, payoutEmail, autoPayout } = req.body;
    const artistId = req.artistId; // From your auth middleware

    // Validation
    if (!bankAccount) {
      return res.status(400).json({
        success: false,
        message: "Bank account is required"
      });
    }

    // Email validation only if payoutEmail is provided
    if (payoutEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payoutEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address"
        });
      }
    }

    // Update artist payment settings
    const updateData = {
      paymentAccount: bankAccount,
      autoPayout: autoPayout !== undefined ? autoPayout : true
    };

    // Only update payoutEmail if provided
    if (payoutEmail) {
      updateData.paymentEmail = payoutEmail;
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      artistId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedArtist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    res.json({
      success: true,
      message: "Payment settings updated successfully",
      paymentSettings: {
        bankAccount: updatedArtist.paymentAccount,
        payoutEmail: updatedArtist.paymentEmail,
        autoPayout: updatedArtist.autoPayout
      }
    });

  } catch (error) {
    console.error("Payment settings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getArtistProfile = async (req, res) => {

  console.log("Fetching artist profile...");
  try {
    if (!req.artistId) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized access" 
      });
    }

    const artist = await Artist.findById(req.artistId)
      .select('-password -__v -songs') // Explicitly exclude songs and sensitive fields
      .lean();

    if (!artist) {
      return res.status(404).json({ 
        success: false,
        message: "Artist not found" 
      });
    }

    const normalizedProfileImage = artist.profileImage
      ? artist.profileImage.replace(/\\/g, '/')
      : null;

      const profileImageUrl = normalizedProfileImage
      ? `http://localhost:5000/${normalizedProfileImage}`
      : null;

    const response = {
      success: true,
      profile: {
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
          bankAccount: artist.paymentAccount ? artist.paymentAccount : null,
          payoutEmail: artist.paymentEmail,
          autoPayout: artist.autoPayout || false
        },
        revenue: {
          monthly: artist.monthlyRevenue || [],
          yearly: artist.yearlyRevenue || []
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error("Get artist profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

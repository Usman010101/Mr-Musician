import bcrypt from "bcryptjs";
import { Listener, Artist,Admin } from "../models/userModels.js";
import jwt from 'jsonwebtoken';

// Helper function for password hashing
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Register a user (Listener or Artist)
export const registerUser = async (req, res) => {

  const { email, password, userType, name, recognizedAs, phoneNo } = req.body;

  // Basic validation
  if (!email || !password || !userType) {
    return res.status(400).json({ message: "Email, password, and role are required" });
  }

  // Additional validation for Artist
  if (userType === "artist" && (!name || !recognizedAs || !phoneNo)) {
    return res.status(400).json({ message: "Name, Recognized As, and Phone Number are required for artists" });
  }

  try {
    // Check if the email already exists in either Listener or Artist collections
    const existingListener = await Listener.findOne({ email });
    const existingArtist = await Artist.findOne({ email });

    if (existingListener || existingArtist) {
      return res.status(400).json({ message: "Email is already registered as a listener or artist" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    let user;
    if (userType === "listener") {
      user = new Listener({ email, password: hashedPassword });
    } else if (userType === "artist") {
      // Create artist with additional fields
      user = new Artist({
        email,
        password: hashedPassword,
        name,
        recognizedAs,
        phoneNo
      });
    }

    // Save user to the database
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login for Listener or Artist
export const loginUser = async (req, res) => {
  const { email, password } = req.body; // Only email and password are needed
  console.log("Email:", email)
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    let user = await Listener.findOne({ email });
    console.log("User:", user)
    if (!user) user = await Artist.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token with the user's ID and type
    const token = jwt.sign(
      { userId: user._id, userType: user.constructor.modelName.toLowerCase() }, // Payload with user ID and type
      process.env.JWT_SECRET_KEY, // Secret key from environment variables
      { expiresIn: '1h' } // Token expiration time
    );

    // Set the token as an HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,  // Ensure this is false for localhost
      maxAge: 3600000,
      sameSite: 'lax', // Make sure cookies are allowed across origins
    });
    
    
    return res.status(200).json({ message: "Login successful",userType: user.constructor.modelName.toLowerCase() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



  

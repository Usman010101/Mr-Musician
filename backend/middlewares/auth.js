import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {

  console.log("cookies:", req.cookies); // Log all cookies
    const token = req.cookies.token
    console.log("Received Token:", token); // Log received token
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }
  
    try {
      console.log("JWT_SECRET:", process.env.JWT_SECRET_KEY); // Check if secret is loaded
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log("Decoded Token:", decoded); // Log decoded token

      if (decoded.userType==='artist'){
        req.artistId = decoded.userId; // Corrected key for user ID
      }else if (decoded.userType==='listener'){
        req.listenerId = decoded.userId; // Corrected key for user ID
      }
      console.log("User ID:", req.artistId); // Log user ID
      next();
    } catch (err) {
      console.error("Token Verification Error:", err.message); // Log error
      return res.status(403).json({ message: "Invalid or expired token." });
    }
  };
  

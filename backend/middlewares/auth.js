import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received Token:", token); // Log received token
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // Log decoded token
      req.artistId = decoded.userId; // Corrected key for user ID
      next();
    } catch (err) {
      console.error("Token Verification Error:", err.message); // Log error
      return res.status(403).json({ message: "Invalid or expired token." });
    }
  };
  

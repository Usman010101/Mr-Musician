import {Song} from "../models/Songs.js"; // Replace with your actual model import
import path from "path";
import fs from "fs";

export const streamSong = async (req, res) => {
  try {
    const { songId } = req.params;

    // Fetch the song from the database using its ID
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    // Resolve the full file path
    const filePath = path.join(process.cwd(), "public", song.fileUrl); // Adjust if "public" is the base folder

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on the server." });
    }

    // Handle range requests for streaming
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return res
          .status(416)
          .header("Content-Range", `bytes */${fileSize}`)
          .send("Requested range not satisfiable");
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mpeg",
      });

      fileStream.pipe(res);
    } else {
      // Serve the whole file if no range is specified
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/mpeg",
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming song:", error.message);
    res.status(500).json({ message: "Error streaming song.", error: error.message });
  }
};

import { Song } from "../models/Songs.js";
import axios from "axios";
import FormData from "form-data";

export const detectSong = async (req, res) => {
  console.log("Detecting Song....")
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "Audio file required" 
      });
    }

    // Step 1: Get fingerprints from Python service
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    
    const pythonResponse = await axios.post(
      "http://localhost:8080/detect",
      form,
      { headers: form.getHeaders() }
    );

    if (!pythonResponse.data.success) {
      return res.status(400).json({
        success: false,
        error: pythonResponse.data.error
      });
    }

    // Step 2: Process matching
    const { hashes, timing_data } = pythonResponse.data;
    
    // Create hash -> sample_time map
    const hashToSampleTime = new Map();
    timing_data.forEach(td => hashToSampleTime.set(td.hash, td.sample_time));

    // Get all matching fingerprints from database
    const matches = await Song.aggregate([
      { $unwind: "$fingerprints" },
      { $match: { "fingerprints.hash": { $in: hashes } } },
      { 
        $project: {
          _id: 1,
          title: 1,
          artistId: 1,
          duration: 1,
          hash: "$fingerprints.hash",
          db_time: "$fingerprints.time"
        }
      }
    ]);

    // Process matches in memory
    const songMap = new Map();

    matches.forEach(match => {
      const sample_time = hashToSampleTime.get(match.hash);
      if (!sample_time) return;

      const offset = match.db_time - sample_time;
      const songId = match._id.toString();

      if (!songMap.has(songId)) {
        songMap.set(songId, {
          songId: match._id,
          title: match.title,
          artistId: match.artistId,
          duration: match.duration,
          offsets: [],
          matches: 0
        });
      }

      const entry = songMap.get(songId);
      entry.offsets.push(offset);
      entry.matches++;
    });

    // Calculate results
    const results = Array.from(songMap.values()).map(entry => {
      const offsetCounts = {};
      let maxCount = 0;
      let commonOffset = 0;
      const binSize = 0.1;
      entry.offsets.forEach(offset => {

        const bin = Math.round(offset / binSize) * binSize;
        offsetCounts[bin] = (offsetCounts[offset] || 0) + 1;
        if (offsetCounts[offset] > maxCount) {
          maxCount = offsetCounts[offset];
          commonOffset = offset;
        }
      });

      return {
        songId: entry.songId,
        title: entry.title,
        artistId: entry.artistId,
        confidence: `${((entry.matches / hashes.length) * 1000).toFixed(1)}%`,
        offset: commonOffset,
        match_count: entry.matches
      };
    });

    // Sort by best matches
    results.sort((a, b) => b.match_count - a.match_count);

    res.json({
      success: true,
      results: results.filter(r => parseFloat(r.confidence) > 0.0),
      sample_duration: pythonResponse.data.duration
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
    console.error("Error in detectSong:", err);
  }
};
// components/AlbumBar.js
'use client'
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AlbumBar({ album }) {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  return (
    <div className="d-flex align-items-center py-3 border-bottom">
      {/* Album Picture and Info */}
      <div className="d-flex align-items-center w-50">
        <img
          src={album.logoUrl}
          alt={album.name}
          className="rounded-circle me-3"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
        <div>
          <div className="fw-bold">{album.name}</div>
          <div className="text-muted">{album.artist}</div>
        </div>
      </div>

      {/* Release Date and Album Name */}
      <div className="w-25">
        <div className="text-muted">{album.releaseDate}</div>
        <div>{album.albumName}</div>
      </div>

      {/* Like Button */}
      <div className="w-15 text-center">
        <FaHeart
          className={`cursor-pointer ${liked ? "text-danger" : ""}`}
          onClick={handleLike}
        />
      </div>

      {/* Time */}
      <div className="w-10 text-center">{album.duration}</div>
    </div>
  );
}

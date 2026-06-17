"use client";
import { useState } from 'react';
import TopAlbum from "@/components/topalbum/topalbum";

export default function TopAlbumCard() {
  // Array of albums (replace with API data if needed)
  const albums = [
    { id: 1, imgurl: '/images/artistprofile.png', title: "Song 1", artist: "Artist 1" },
    { id: 2, imgurl: '/images/artistprofile.png', title: "Song 2", artist: "Artist 2" },
    { id: 3, imgurl: '/images/artistprofile.png', title: "Song 3", artist: "Artist 3" },
    { id: 4, imgurl: '/images/artistprofile.png', title: "Song 4", artist: "Artist 4" },
    { id: 5, imgurl: '/images/artistprofile.png', title: "Song 5", artist: "Artist 5" },
    { id: 6, imgurl: '/images/artistprofile.png', title: "Song 6", artist: "Artist 6" },
    { id: 7, imgurl: '/images/artistprofile.png', title: "Song 7", artist: "Artist 7" },
    { id: 8, imgurl: '/images/artistprofile.png', title: "Song 8", artist: "Artist 8" },
    { id: 9, imgurl: '/images/artistprofile.png', title: "Song 9", artist: "Artist 9" },
    { id: 10, imgurl: '/images/artistprofile.png', title: "Song 10", artist: "Artist 10" },
  ];

  // State to manage how many albums are visible
  const [visibleAlbums, setVisibleAlbums] = useState(4);

  // Function to load more albums
  const showMoreAlbums = () => {
    setVisibleAlbums((prev) => prev + 4); // Increase visible albums by 4
  };

  return (
    <div>
      <div className="mt-5 row mx-2">
        <div className="col-12 mb-4">
          <h2 className="fw-bold">
            Top <span style={{ color: "#ee10b0" }}>Albums</span>
          </h2>
        </div>

        {/* Render visible albums */}
        {albums.slice(0, visibleAlbums).map((album) => (
          <div key={album.id} className="col-lg-3 col-md-4 col-sm-6">
            <TopAlbum
              id={album.id}
              imgurl={album.imgurl}
              title={album.title}
              artist={album.artist}
            />
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {visibleAlbums < albums.length && (
        <div className="text-center mt-4">
          <button
            className="btn btn-primary"
            onClick={showMoreAlbums}
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
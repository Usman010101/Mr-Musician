import React from "react";
import GenreCard from "@/section/discover/MusicGenre";
import MoodLibraryCard from "@/section/discover/MoodLibrary";
import PopularArtistCard from "@/section/discover/PopularArtist";
import MusicCard from "@/section/discover/Music";

import TopAlbumCard from "@/section/discover/TopAlbum";

const DiscoverPage = () => {
  return (
    <div className="container p-6 bg-black text-white min-h-screen">
      <div className="row">
        <div className="col">
          <GenreCard />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <MoodLibraryCard />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <PopularArtistCard />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <MusicCard />
        </div>
      </div>
      
      <div className="row">
        <div className="col">
          <TopAlbumCard />
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
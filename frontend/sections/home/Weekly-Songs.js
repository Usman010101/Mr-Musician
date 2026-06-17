'use client';
import { usePlayer } from '@/app/(listener)/context/PlayerContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import PlayCard from "@/components/play-card/playCard";
import Link from 'next/link';

export default function WeeklySongs({ songs }) {
  const { actions } = usePlayer();

  const handlePlay = (song) => {
    actions.setTrack({
      title: song.title,
      artist: song.artistName || 'Unknown Artist',
      cover: `http://localhost:5000/${song.imageUrl}`,
      src: `http://localhost:5000/${song.fileUrl}`,
      genre:song.genre
    });
    actions.play();
  };

  

  return (
    <div className="mt-5 mx-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          Weekly <span style={{ color: "#ee10b0" }}>Songs</span>
        </h2>
        <Link href="/songs" className="btn btn-outline-primary">
          View More
        </Link>
      </div>

      {songs.length > 0 ? (
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={4}
          navigation
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 }
          }}
        >
          {songs.map((song) => (
            <SwiperSlide key={song._id}>
              <PlayCard 
                imgurl={`http://localhost:5000/${song.imageUrl}`}
                title={song.title}
                artist={song.artistName}
                onClick={() => handlePlay(song)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-center py-3">No songs available</p>
      )}
    </div>
  );
}
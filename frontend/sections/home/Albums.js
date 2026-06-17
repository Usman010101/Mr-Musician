'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import AlbumCard from '@/components/AlbumCard/AlbumCard';
import Link from 'next/link';

export default function Albums({ albums }) {
  return (
    <div className="mt-5 mx-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          New <span style={{ color: "#ee10b0" }}>Albums</span>
        </h2>
        <Link href="/albums" className="btn btn-outline-primary">
          View More
        </Link>
      </div>

      {albums?.length > 0 ? (
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
          {albums.map((album) => (
            <SwiperSlide key={album._id}>
              <AlbumCard 
                id={album._id}
                imgurl={album.coverImage || '/images/default-album.png'}
                title={album.title}
                artist={album.artistName}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-center py-3">No albums available</p>
      )}
    </div>
  );
}
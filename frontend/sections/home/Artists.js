'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ArtistCard from '@/components/artists-card/artistsCard';
import Link from 'next/link';

export default function Artists({ artists }) {
  
  return (
    
    <div className="mt-5 mx-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          Popular <span style={{ color: "#ee10b0" }}>Artists</span>
        </h2>
        <Link href="/artists" className="btn btn-outline-primary">
          View More
        </Link>
      </div>

      {artists?.length > 0 ? (
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
          {artists.map((artist) => (
            <SwiperSlide key={artist._id}>
              <ArtistCard 
                id={artist._id}
                imgurl={artist.profileImage || '/images/default-artist.png'}
                name={artist.name}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-center py-3">No artists available</p>
      )}
    </div>
  );
}
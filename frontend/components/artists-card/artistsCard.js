'use client';
import styles from './artistsCard.module.css';
import Link from 'next/link';

export default function ArtistCard({ id, imgurl, name }) {
  console.log("ArtistCard", imgurl, name);
  return (
    <Link href={`/artist/${id}`} passHref legacyBehavior>
      <div 
        className={`${styles['artist-card']} position-relative`}
        data-id={id}
      >
        <div className="d-flex flex-column align-items-center">
          {/* Circular Image Container */}
          <div className={`${styles['image-container']} rounded-circle overflow-hidden shadow-lg mb-3`}>
            <img 
              src={imgurl} 
              alt={name} 
              className={`img-fluid ${styles['artist-image']}`}
              onError={(e) => {
                e.target.src = '/images/default-artist.png';
              }}
            />
          </div>

          {/* Artist Name */}
          <h3 className={`${styles['artist-name']} text-center mb-0`}>
            {name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
"use client";
import styles from './artistsCard.module.css';

export default function ArtistCard({ id, imgurl, name }) {
  return (
    <div 
      className={`col-6 col-md-4 col-lg-3 mb-4 position-relative ${styles['artist-card']}`}
      data-id={id}
    >
      <div className="d-flex flex-column align-items-center">
        {/* Circular Image Container */}
        <div className={`${styles.imageContainer} rounded-circle overflow-hidden shadow-lg mb-3`}>
          <img 
            src={imgurl} 
            alt={`${name}`} 
            className={`img-fluid ${styles.artistImage}`}
          />
        </div>

        {/* Artist Name */}
        <h3 className="text-white fs-5 fw-bold text-center mb-0">
          {name}
        </h3>
      </div>
    </div>
  );
}
'use client';
import styles from './albumcard.module.css';
import Link from 'next/link';

export default function AlbumCard({ id, imgurl, title, artist }) {
  return (
    <Link href={`/album/${id}`} passHref legacyBehavior>
      <div className={styles['album-card']}>
        {/* Album Cover with Gradient Overlay */}
        <div className={styles['cover-container']}>
          <img 
            src={imgurl} 
            alt={title} 
            className={styles['album-cover']}
            onError={(e) => {
              e.target.src = '/images/default-album.png';
            }}
          />
          <div className={styles['gradient-overlay']}></div>
        </div>
        
        {/* Album Info Floating Over Cover */}
        <div className={styles['album-info']}>
          <h3 className={styles['title']}>{title}</h3>
          <p className={styles['artist']}>{artist}</p>
          <div className={styles['play-button']}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
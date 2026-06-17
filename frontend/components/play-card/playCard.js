'use client';
import { usePlayer } from "@/app/(listener)/context/PlayerContext";
import styles from "./play-card.module.css";

export default function PlayCard({ 
  imgurl, 
  title, 
  artist, 
  onClick
}) {
  const { state } = usePlayer();
  const isCurrentTrack = state.currentTrack?.title === title && 
                        state.currentTrack?.artist === artist;

  return (
    <div 
      className={`${styles.playCard} ${isCurrentTrack ? styles.active : ''}`}
      onClick={onClick}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.cardImageContainer}>
        <img 
          src={imgurl} 
          alt={title} 
          className={styles.cardImage}
          onError={(e) => {
            e.target.src = '/default-music.png';
          }} 
        />
        <div className={styles.playOverlay}>
          <div className={`${styles.playButton} ${isCurrentTrack && state.isPlaying ? styles.playing : ''}`}>
            {isCurrentTrack && state.isPlaying ? (
              <div className={styles.equalizer}>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
              </div>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardArtist}>{artist}</p>
      </div>
    </div>
  );
}
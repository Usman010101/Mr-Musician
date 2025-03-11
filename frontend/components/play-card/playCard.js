'use client';
import styles from './play-card.module.css';
import { FaPlay } from 'react-icons/fa';
import { usePlayer } from '@/app/context/PlayerContext';
export default function PlayCard({ id, imgurl, title, artist }) {
  const {state,actions}=usePlayer()
  const song = {
    title: "Hello ",
    artist: "Adele ",
    cover: "/images/Adele.png", // Add a cover image to your public folder
    src: "/images/song123.mp3",    // Your song file path in the public folder
  };
  const handlePlay=()=>{
    actions.setTrack(song)
    actions.play();
  }
  return (
    <div className={styles['play-card']} data-id={id} onClick={handlePlay}>
      {/* Song Image */}
      <img src={song.cover} alt={`${title} cover`} className={styles['card-image']} />

      {/* Title */}
      <div className={styles['card-title']}>{title}</div>

      {/* Artist Name */}
      <div className={styles['artist-name']}>{artist}</div>

      {/* Play Button */}
      <div className={styles['play-button']}>
        <FaPlay className={styles['play-icon']} size={24} />
      </div>
    </div>
  );
}

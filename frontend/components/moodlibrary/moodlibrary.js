'use client';
import styles from "./moodlibrary.module.css";
import { FaPlay } from 'react-icons/fa';
import { usePlayer } from '@/app/(listener)/context/PlayerContext';
export default function MoodLibrary({ id, imgurl, title,playlist}) {
  const {state,actions}=usePlayer()
  const song = {
    title: "Sad ",
    cover: "/images/Adele.png", // Add a cover image to your public folder
    src: "/images/song123.mp3", 
    playlist: "Sad Playlist" ,  // Your song file path in the public folder
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

      <div className={styles['playlist-name']}>{playlist}</div>

      {/* Play Button */}
      <div className={styles['play-button']}>
        <FaPlay className={styles['play-icon']} size={24} />
      </div>
    </div>
  );
}

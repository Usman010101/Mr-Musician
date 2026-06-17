'use client';
import { usePlayer } from '@/app/(listener)/context/PlayerContext';
import { useState } from 'react';
import { FaPlay, FaPause, FaHeart, FaRegHeart } from 'react-icons/fa';
import styles from './song.module.css'

export default function SongsTable({ songs }) {
  const { state, actions } = usePlayer();
  const [likedSongs, setLikedSongs] = useState({});

  const handlePlay = async (song) => {
    if (state.currentTrack?.title === song.title && state.isPlaying) {
      actions.pause();
    } else {
      await actions.setTrack({
        title: song.title,
        artist: song.artistName || 'Unknown Artist',
        cover: `http://localhost:5000/${song.imageUrl}`,
        src: `http://localhost:5000/${song.fileUrl}`
      });
    }
  };

  const toggleLike = (songId, e) => {
    e.stopPropagation();
    console.log("Toggling like for song ID:", songId);
    setLikedSongs(prev => ({
      ...prev,
      [songId]: !prev[songId]
    }));
    // API call to update like status would go here
  };

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.header}>#</th>
            <th className={styles.header}>Title</th>
            <th className={styles.header}>Artist</th>
            <th className={styles.header}>Album</th>
            <th className={styles.header}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => {
            const isCurrentPlaying = state.currentTrack?.title === song.title && state.isPlaying;
            return (
              <tr 
                key={song._id} 
                className={`${styles.row} ${isCurrentPlaying ? styles.active : ''}`}
                onClick={() => handlePlay(song)}
              >
                <td className={styles.cell}>{index + 1}</td>
                <td className={styles.cell}>
                  <div className={styles.songInfo}>
                    <img 
                      src={`http://localhost:5000/${song.imageUrl}`} 
                      alt={song.title}
                      className={styles.songImage}
                      onError={(e) => {
                        e.target.src = '/default-music.png';
                      }}
                    />
                    <span>
                      {song.title}
                      {isCurrentPlaying && (
                        <FaPlay className={styles.playIcon} size={10} />
                      )}
                    </span>
                  </div>
                </td>
                <td className={styles.cell}>{song.artistName}</td>
                <td className={styles.cell}>{song.albumName || 'Single'}</td>
                <td className={styles.cell}>
                  <button 
                    className={`${styles.likeButton} ${likedSongs[song._id] ? styles.liked : ''}`}
                    onClick={(e) => toggleLike(song.id, e)}
                  >
                    {likedSongs[song.id] ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
// app/album/[id]/page.js
'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePlayer } from '@/app/(listener)/context/PlayerContext';
import { FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import styles from '../../../page.module.css';

export default function AlbumPage() {
  const { actions, state } = usePlayer();
  const router = useParams();
  const { albumId } = router;
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedSongs, setLikedSongs] = useState({});

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/listeners/album/${albumId}`);
        if (!response.ok) throw new Error('Failed to fetch album data');
        const data = await response.json();
        setAlbum(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]);

  const handlePlay = async (song) => {
    if (state.currentTrack?.title === song.title && state.isPlaying) {
      actions.pause();
    } else {
      await actions.setTrack({
        title: song.title,
        artist: song.artistName  ,
        cover: song.imageUrl,
        src:song.fileUrl
      });
    }
  };

  const toggleLike = (songId, e) => {
    e.stopPropagation();
    setLikedSongs(prev => ({ ...prev, [songId]: !prev[songId] }));
    // API call to update like status
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!album) return <div className={styles.error}>Album not found</div>;

  return (
    <div className={styles.container}>
      {/* Album Header */}
      <div className={styles.albumHeader}>
        <img
          src={album.coverImageUrl}
          alt={album.title}
          className={styles.albumArt}
        />
        <div className={styles.albumInfo}>
          <h1 className={styles.albumTitle}>{album.title}</h1>
          <div className={styles.metaData}>
            <span>{album.artist?.name}</span>
            <span>{album.songs.length} songs</span>
          </div>
          <button 
            className={styles.playButton}
            onClick={() => actions.playCollection(album.songs.map(formatSong))}
          >
            <FaPlay /> Play All
          </button>
        </div>
      </div>

      {/* Songs Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.header}>#</th>
              <th className={styles.header}>Title</th>
              <th className={styles.header}>Album</th>
              <th className={styles.header}></th>
            </tr>
          </thead>
          <tbody>
            {album.songs.map((song, index) => {
              const isCurrentPlaying = state.currentTrack?.title === song.title && state.isPlaying;
              return (
                <tr 
                  key={song._id} 
                  className={`${styles.row} ${isCurrentPlaying ? styles.active : ''}`}
                  onClick={() => handlePlay(song)}
                >
                  <td className={styles.indexCell}>
                    {isCurrentPlaying ? <FaPlay className={styles.playIcon} /> : index + 1}
                  </td>
                  <td className={styles.titleCell}>
                    <div className={styles.songInfo}>
                      <img 
                        src={song.imageUrl} 
                        alt={song.title}
                        className={styles.songImage}
                      />
                      <span>{song.title}</span>
                    </div>
                  </td>
                 
                  <td className={styles.albumCell}>{song.albumName || 'Single'}</td>
                  <td className={styles.likeCell}>
                    <button 
                      className={`${styles.likeButton} ${likedSongs[song._id] ? styles.liked : ''}`}
                      onClick={(e) => toggleLike(song._id, e)}
                    >
                      {likedSongs[song._id] ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatSong(song) {
  return {
    id: song._id,
    title: song.title,
    artist: song.artistName,
    cover: song.imageUrl,
    src: song.fileUrl,
    duration: song.duration
  };
}
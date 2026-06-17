'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaHeadphones, FaHeart } from 'react-icons/fa';
import styles from './Profile.module.css';

const ArtistProfile = () => {
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artistname, setArtistName] = useState('');
  const [artistProfile, setArtistProfile] = useState(null);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [error, setError] = useState(null);
  const [toggleTable, setToggleTable] = useState("songs");
  const [loading, setLoading] = useState(true);
  const [refresh,setRefresh]= useState(false)

  const getFilename = (url) => {
    if (!url) return '';
    return url.split(/[\\/]/).pop();
  };



   const fetchData = async () => {
      try {
        setLoading(true);
        
        const [artistProfileData, albumsData] = await Promise.all([
          axios.get('http://localhost:5000/api/artist/getArtistProfile', {
            withCredentials: true,
          }),
          axios.get('http://localhost:5000/api/albums/getAlbums', {
            withCredentials: true,
          })
        ]);

        
        setSongs(artistProfileData.data.songs);
        setArtistName(artistProfileData.data.artist.basicInfo.name);
        setArtistProfile(artistProfileData.data.artist.basicInfo.profileImage);
        setViews(artistProfileData.data.artist?.stats?.views || 0);
        setLikes(artistProfileData.data.artist?.stats?.likes || 0);
        setAlbums(albumsData.data.albums);
        
        
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };
  
    useEffect(() => {
   
    fetchData();
  }, [refresh]);


  const handleDeleteSong = async (songId) => {
    if (!window.confirm('Are you sure you want to delete this song?')) {
      return;
    }
    console.log("Song id :", songId)
    try {
      const response = await axios.post(
        `http://localhost:5000/api/updateSongs/deleteSong/${songId}`,
        {},
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        setRefresh(prev => !prev)
        alert('Song deleted successfully!');
      }
    } catch (err) {
      console.error("Error deleting song:", err);
      alert("Failed to delete song");
      setRefresh(prev => !prev)

    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('Are you sure you want to delete this album?')) {
      return;
    }
    try {
      console.log("Album id :", albumId)
      const response = await axios.post(
        `http://localhost:5000/api/albums/deleteAlbum/${albumId}`,{},
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
         }
      );
      console.log("Response from delete album:", response.data)
      
      if (response.data.success) {
        setRefresh(prev => !prev)
        
        console.log("Songs after album deletion:", songs.filter(song => song.albumId !== albumId)); 
        alert('Album deleted successfully!');
      }
    } catch (err) {
      console.error("Error deleting album:", err);
      alert("Failed to delete album");
        setRefresh(prev => !prev)

    }
  };

  

  return (
    <div className={styles.profileContainer}>
      {/* Artist Header */}
      <div className={styles.artistHeader}>
        <div className={styles.profileImage}>
          <div className={styles.imagePlaceholder}
            style={{
              backgroundImage: `url(${artistProfile})`,
              backgroundSize: 'cover',
            }}></div>
        </div>

        <div className={styles.artistInfo}>
          <h1 className={styles.artistName}>{artistname}</h1>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <FaHeadphones className={styles.statIcon} />
              <span className={styles.statNumber}>{views}</span>
              <span className={styles.statLabel}>Total Views</span>
            </div>
            <div className={styles.statItem}>
              <FaHeart className={styles.statIcon} />
              <span className={styles.statNumber}>{likes}</span>
              <span className={styles.statLabel}>Total Likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="text-center mb-4">
        <button
          className={`${styles['btn-switch']} ${toggleTable === "songs" ? styles.active : ""}`}
          onClick={() => setToggleTable("songs")}
        >
          Songs
        </button>
        <button
          className={`${styles['btn-switch']} ${toggleTable === "albums" ? styles.active : ""}`}
          onClick={() => setToggleTable("albums")}
        >
          Albums
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {/* Content Area */}
      {!loading && !error && (
        toggleTable === "songs" ? (
          <div className={styles.songsTable}>
            <div className={styles.tableHeader}>
              <span className={styles.headerItem}>Track</span>
              <span className={styles.headerItem}>Views</span>
              <span className={styles.headerItem}>Likes</span>
              <span className={styles.headerItem}>Actions</span>
            </div>

            {songs.length > 0 ? (
              songs.map((song) => (
                <div key={song._id} className={styles.tableRow}>
                  <div className={styles.trackInfo}>
                    <div className={styles.songThumbnail} style={{
                      backgroundImage: `url(http://localhost:5000/songs/${getFilename(song.imageUrl)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}></div>
                    <span className={styles.songName}>{song.title}</span>
                  </div>

                  <span className={styles.views}>{song.views}</span>
                  <span className={styles.likes}>{song.likes}</span>

                  <div className={styles.actions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteSong(song.id)}
                    >
                      <FaTrash />
                    </button>
                    <button className={styles.editButton}>
                      <FaEdit />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyMessage}>No songs found</div>
            )}
          </div>
        ) : toggleTable === "albums" ? (
          <div className={styles.songsTable}>
            <div className={styles.tableHeader}>
              <span className={styles.headerItem}>Album</span>
              <span className={styles.headerItem}>Release Date</span>
              <span className={styles.headerItem}>Songs</span>
              <span className={styles.headerItem}>Actions</span>
            </div>

            {albums.length > 0 ? (
              albums.map((album) => (
                <div key={album._id} className={styles.tableRow}>
                  <div className={styles.trackInfo}>
                    <div className={styles.songThumbnail} style={{
                      backgroundImage: `url(http://localhost:5000/albums/${encodeURIComponent(getFilename(album.coverImageUrl))}`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}></div>
                    <span className={styles.songName}>{album.title}</span>
                  </div>

                  <span className={styles.views}>
                    {new Date(album.releaseDate).toLocaleDateString()}
                  </span>
                  <span className={styles.likes}>{album.songs.length}</span>

                  <div className={styles.actions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteAlbum(album._id)}
                    >
                      <FaTrash />
                    </button>
                    <button className={styles.editButton}>
                      <FaEdit />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyMessage}>No albums found</div>
            )}
          </div>
        ) : (
          <div className={styles.emptyMessage}>Nothing to show</div>
        )
      )}
    </div>
  );
};

export default ArtistProfile;
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from './AlbumsPage.module.css';
import { FaSearch } from 'react-icons/fa';

export default function AlbumsPage() {
  const [albumsData, setAlbumsData] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/listeners/getallInfo');
        
        // Flatten all albums from all artists
        const allAlbums = response.data.data.flatMap(artist => 
          artist.albums.map(album => ({
            ...album,
            artist: {
              id: artist.id,
              name: artist.name,
              profileImage: artist.profileImage
            }
          }))
        );

        setAlbumsData(allAlbums);
        setFilteredAlbums(allAlbums);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch albums data");
        setLoading(false);
      }
    };

    fetchAlbumsData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAlbums(albumsData);
    } else {
      const filtered = albumsData.filter(album => 
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAlbums(filtered);
    }
  }, [searchTerm, albumsData]);

  if (loading) return <div className={styles.loading}>Loading albums...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.albumsPage}>
      <div className={styles.header}>
        <h1>All Albums</h1>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search albums or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.albumsGrid}>
        {filteredAlbums.length > 0 ? (
          filteredAlbums.map(album => (
            <Link 
              key={album.id} 
              href={`/album/${album.id}`}
              className={styles.albumCard}
            >
              <div 
                className={styles.albumCover}
                style={{ backgroundImage: `url(http://localhost:5000/${album.coverImageUrl})` }}
              />
              <div className={styles.albumInfo}>
                <h3 className={styles.albumTitle}>{album.title}</h3>
                <p className={styles.artistName}>{album.artist.name}</p>
                <div className={styles.albumStats}>
                  <span>{album.songs.length} {album.songs.length === 1 ? 'song' : 'songs'}</span>
                  <span>{new Date(album.releaseDate).getFullYear()}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No albums found matching "{searchTerm}"</p>
            <button 
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
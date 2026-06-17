'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ArtistCard from '@/components/artists-card/artistsCard';
import styles from './ArtistsPage.module.css';
import { FaSearch } from 'react-icons/fa';

export default function ArtistsPage() {
  const [artistsData, setArtistsData] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtistsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/listeners/getallInfo');
        
        // Process artist data with proper image URLs
        const artists = response.data.data.map(artist => ({
          id: artist.id,
          imgurl: artist.profileImage ? 
            `http://localhost:5000/${artist.profileImage}` : 
            '/default-artist.png', // Use a fallback path that exists
          title: artist.name,
          stats: {
            views: artist.albums?.reduce((sum, album) => 
              sum + (album.songs?.reduce((songSum, song) => songSum + (song.views || 0), 0) || 0), 0) || 0,
            likes: artist.albums?.reduce((sum, album) => 
              sum + (album.songs?.reduce((songSum, song) => songSum + (song.likes || 0), 0) || 0), 0) || 0
          }
        }));

        setArtistsData(artists);
        setFilteredArtists(artists);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching artists:', err);
        setError(err.message || "Failed to fetch artists data");
        setLoading(false);
      }
    };

    // Add cancellation to prevent multiple requests
    const controller = new AbortController();
    fetchArtistsData();

    return () => controller.abort(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArtists(artistsData);
    } else {
      const filtered = artistsData.filter(artist => 
        artist.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArtists(filtered);
    }
  }, [searchTerm, artistsData]);

  if (loading) return <div className={styles.loading}>Loading artists...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.artistsPage}>
      <div className={styles.header}>
        <h1>All Artists</h1>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.artistsGrid}>
        {filteredArtists.length > 0 ? (
          filteredArtists.map(artist => (
            <ArtistCard
              key={artist.id}
              id={artist.id}
              imgurl={artist.imgurl}
              name={artist.title}
              
            />
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No artists found matching "{searchTerm}"</p>
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
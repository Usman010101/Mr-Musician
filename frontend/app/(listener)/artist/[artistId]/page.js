'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHeadphones, FaHeart, FaPlay } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import Link from 'next/link';
import styles from './ArtistPage.module.css';
import { redirect, useParams } from 'next/navigation';

const ArtistPage = () => {
    const { actions, state } = usePlayer();
    const [artistData, setArtistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('songs');
    const router = useParams();
    const { artistId } = router;


    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                console.log('Fetching artist data...', artistId);
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/listeners/artist/${artistId}`);

                setArtistData(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Failed to fetch artist data");
                setLoading(false);
            }
        };

        fetchArtistData();
    }, [artistId]);

    const handlePlaySong = async (song) => {
        if (state.currentTrack?.title === song.title && state.isPlaying) {
            actions.pause();
        } else {
            await actions.setTrack({
                title: song.title,
                artist: artistData.artist?.name,
                cover: `http://localhost:5000/${song.imageUrl}`,
                src: `http://localhost:5000/${song.fileUrl}`
            });
        }
        console.log("Profilelink", artistData.artist?.profileImage)

    };




    const handleAlbumClick = (album, e) => {
        redirect(`/album/${album.id}`);
    };

    if (loading) return <div className={styles.loading}>Loading artist data...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!artistData) return <div className={styles.error}>Artist not found</div>;

    return (
        <div className={styles.artistPage}>
            {/* Artist Header */}
            <div className={styles.artistHeader}>
                <div className={styles.profileImageContainer}>
          <img
            src={artistData?.artist?.profileImage}
            alt={`${artistData?.artist?.name}'s profile`}
            className={styles.profileImage}
          />
        </div>



                <div className={styles.artistInfo}>
                    <h1 className={styles.artistName}>{artistData.artist.name}</h1>
                    <p className={styles.artistBio}>{artistData.artist.bio || 'No biography available'}</p>

                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <FaHeadphones className={styles.statIcon} />
                            <span>{artistData.artist.stats.views.toLocaleString()} plays</span>
                        </div>
                        <div className={styles.statItem}>
                            <FaHeart className={styles.statIcon} />
                            <span>{artistData.artist.stats.likes.toLocaleString()} likes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'songs' ? styles.active : ''}`}
                    onClick={() => setActiveTab('songs')}
                >
                    Songs
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'albums' ? styles.active : ''}`}
                    onClick={() => setActiveTab('albums')}
                >
                    Albums
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.content}>
                {activeTab === 'songs' ? (
                    <>
                        <h2 className={styles.sectionTitle}>Popular Songs</h2>
                        <div className={styles.songsList}>
                            {artistData.singles.map(song => (
                                <div key={song._id} className={styles.songItem} onClick={() => handlePlaySong(song)}>
                                    <div className={styles.songInfo}>
                                        <div
                                            className={styles.songImage}
                                            style={{ backgroundImage: `url(http://localhost:5000/${song.imageUrl})` }}
                                        />
                                        <div>
                                            <h3 className={styles.songTitle}>{song.title}</h3>
                                            <p className={styles.songDetails}>Single • {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</p>
                                        </div>
                                    </div>
                                    <button className={styles.playButton}>
                                        <FaPlay />
                                    </button>
                                </div>
                            ))}

                            {artistData.albums.map(album => (
                                album.songs.map(song => (
                                    <div key={song._id} className={styles.songItem} onClick={() => handlePlaySong(song)}>
                                        <div className={styles.songInfo}>
                                            <div
                                                className={styles.songImage}
                                                style={{ backgroundImage: `url(http://localhost:5000/${song.imageUrl})` }}
                                            />
                                            <div>
                                                <h3 className={styles.songTitle}>{song.title}</h3>
                                                <p className={styles.songDetails}>
                                                    {album.title} • {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                                                </p>
                                            </div>
                                        </div>
                                        <button className={styles.playButton}>
                                            <FaPlay />
                                        </button>
                                    </div>
                                ))
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className={styles.sectionTitle}>Albums</h2>
                        <div className={styles.albumsGrid}>
                            {artistData.albums.map(album => (
                                <Link key={album.id} href={`/album/${album.id}`} className={styles.albumCard}>
                                    <div
                                        className={styles.albumCover}
                                        style={{ backgroundImage: `url(http://localhost:5000/${album.coverImageUrl})` }}
                                    />
                                    <h3 className={styles.albumTitle}>{album.title}</h3>
                                    <p className={styles.albumDetails}>
                                        {album.songs.length} songs • {new Date(album.releaseDate).getFullYear()}
                                    </p>
                                    <button
                                        className={styles.playAlbumButton}
                                        onClick={(e) => handlePlayAlbum(album, e)}
                                    >
                                        <FaPlay /> Play Album
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ArtistPage;
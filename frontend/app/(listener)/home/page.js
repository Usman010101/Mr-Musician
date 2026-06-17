'use client'
import Artists from "@/sections/home/Artists";
import SongsTable from "@/components/SongTable/SongTable";
import Section1 from "@/sections/home/Section-1";
import WeeklySongs from "@/sections/home/Weekly-Songs";
import { useEffect, useState } from "react";
import Albums from "@/sections/home/Albums";

export default function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/listeners/getallInfo");
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await res.json();
                
                setData(result.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const artists = data.map(artist => {
        return {
            _id: artist.id,
            name: artist.name,
            profileImage: `http://localhost:5000/${artist.profileImage}`,
        }
    })

    const albums = data?.flatMap(artist =>
        artist.albums?.map(album => ({
            _id: album.id,
            title: album.title,
            coverImage: `http://localhost:5000${album.coverImageUrl}`,
            artistName: artist.name,
            artistId: artist.id
        })) || []
    ) || [];





    const allSongs = data.flatMap(artist =>
        artist.albums?.flatMap(album =>
            album.songs?.map(song => ({
                ...song,
                artistName: artist.name,
                artistImage: artist.profileImage,
                albumName: album.title
            })) || []
        ) || []
    );

    if (loading) return <div className="text-center py-5">Loading...</div>;
    if (error) return <div className="text-center py-5 text-danger">Error: {error}</div>;

    return (
        <div className="container">
            <div className="row">
                <div className="col">
                    <Section1 />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <WeeklySongs songs={allSongs} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <SongsTable songs={allSongs} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Artists artists={artists} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Albums albums={albums} />
                </div>
            </div>
        </div>
    );
}
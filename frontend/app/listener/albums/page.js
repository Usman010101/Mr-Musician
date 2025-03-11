// Example usage in another component or page
import AlbumBar from "@/components/album-bar/album-bar";
import AlbumHeader from "@/components/album-header/album-header";
const albums = [
  {
    logoUrl: "path/to/album-logo.jpg",
    name: "Song Title",
    artist: "Artist Name",
    releaseDate: "2022-12-25",
    albumName: "Album Name",
    duration: "3:25",
  },
  {
    logoUrl: "path/to/another-logo.jpg",
    name: "Another Song Title",
    artist: "Another Artist",
    releaseDate: "2023-01-01",
    albumName: "Another Album",
    duration: "4:00",
  },
];

export default function AlbumsPage() {
  return (
    <div className="mt-5 mx-2">    
    <AlbumHeader title="Top Hits" description="Best of 2023" songCount={10} duration="45:00" coverUrl="" />
    <div className="container">
      <div className="mt-5">
        {albums.map((album, index) => (
          <AlbumBar key={index} album={album} />
        ))}
      </div>
    </div>
    </div>
  );
}

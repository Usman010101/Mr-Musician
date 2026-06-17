"use client";

import { useState, useEffect } from "react";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { FaMusic, FaCompactDisc } from "react-icons/fa";

export default function UploadSongs() {
  const [view, setView] = useState("options"); // 'options', 'song', or 'album'
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch existing albums
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/albums/getAlbums", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setAlbums(data.albums);
        } else {
          setErrorMessage(data.message || "Failed to load albums");
        }
      } catch (err) {
        setErrorMessage("Failed to connect to server");
      }
    };
    fetchAlbums();
  }, []);

  const renderOptions = () => (
    <div className="row justify-content-center" style={{ gap: "2rem" }}>
      <div 
        className="col-md-5 p-0"
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          border: "1px solid #333"
        }}
        onClick={() => setView("song")}
      >
        <div 
          className="h-100 d-flex flex-column" 
          style={{
            backgroundColor: "#222", 
            color: "#fff",
            padding: "2rem",
            height: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#EE10B020",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem"
          }}>
            <FaMusic size={36} style={{ color: "#EE10B0" }} />
          </div>
          <h3 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Add Song</h3>
          <p style={{ 
            color: "#aaa", 
            textAlign: "center",
            marginBottom: "0",
            fontSize: "0.9rem"
          }}>
            Upload a new song to your library
          </p>
        </div>
      </div>
      
      <div 
        className="col-md-5 p-0"
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          border: "1px solid #333"
        }}
        onClick={() => setView("album")}
      >
        <div 
          className="h-100 d-flex flex-column" 
          style={{
            backgroundColor: "#222", 
            color: "#fff",
            padding: "2rem",
            height: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#EE10B020",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem"
          }}>
            <FaCompactDisc size={36} style={{ color: "#EE10B0" }} />
          </div>
          <h3 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Add Album</h3>
          <p style={{ 
            color: "#aaa", 
            textAlign: "center",
            marginBottom: "0",
            fontSize: "0.9rem"
          }}>
            Create a new album for your songs
          </p>
        </div>
      </div>
    </div>
  );

  const AddSongForm = () => {
    const [file, setFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("");
    const [selectedAlbum, setSelectedAlbum] = useState("");

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };

    const handleImageChange = (e) => {
      setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!file || !imageFile || !title || !genre || !selectedAlbum) {
        setErrorMessage("Please fill in all required fields!");
        return;
      }

      const formData = new FormData();
      formData.append("song", file);
      formData.append("image", imageFile);
      formData.append("title", title);
      formData.append("genre", genre);
      formData.append("albumId", selectedAlbum);

      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/upload/song/${selectedAlbum}`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (res.ok) {
          alert("Song uploaded successfully!");
          // Reset form
          setFile(null);
          setImageFile(null);
          setTitle("");
          setGenre("");
          setSelectedAlbum("");
          setView("options");
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error uploading song");
        }
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{
        backgroundColor: "#222",
        borderRadius: "10px",
        padding: "2rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        border: "1px solid #333"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "1px solid #333",
          paddingBottom: "1rem"
        }}>
          <h1 style={{ 
            color: "#EE10B0",
            fontSize: "1.8rem",
            fontWeight: "600",
            margin: "0"
          }}>
            Add New Song
          </h1>
          <button 
            onClick={() => setView("options")}
            style={{
              backgroundColor: "transparent",
              color: "#aaa",
              border: "1px solid #444",
              borderRadius: "5px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: "500",
              fontSize: "0.9rem"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#333"}
            onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Back
          </button>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: "#ff4444",
            color: "#fff",
            padding: "1rem",
            borderRadius: "5px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem"
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#eee",
              fontWeight: "500",
              fontSize: "0.95rem"
            }}>
              Song Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "5px",
                border: "1px solid #444",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#eee",
              fontWeight: "500",
              fontSize: "0.95rem"
            }}>
              Genre
            </label>
            <Input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Enter genre"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "5px",
                border: "1px solid #444",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#eee",
              fontWeight: "500",
              fontSize: "0.95rem"
            }}>
              Album
            </label>
            <select
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "5px",
                border: "1px solid #444",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "1rem",
                appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.5rem"
              }}
            >
              <option value="">Select an album</option>
              {albums.map((album) => (
                <option key={album._id} value={album._id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#eee",
              fontWeight: "500",
              fontSize: "0.95rem"
            }}>
              Song File
            </label>
            <div style={{
              border: "1px dashed #444",
              borderRadius: "5px",
              padding: "1.5rem",
              textAlign: "center",
              backgroundColor: "#333",
              transition: "all 0.2s ease"
            }}>
              <input
                type="file"
                onChange={handleFileChange}
                required
                accept="audio/*"
                style={{ display: "none" }}
                id="song-upload"
              />
              <label 
                htmlFor="song-upload"
                style={{
                  display: "block",
                  cursor: "pointer",
                  color: "#aaa"
                }}
              >
                {file ? (
                  <div>
                    <div style={{ color: "#EE10B0", marginBottom: "0.5rem" }}>
                      <FaMusic size={24} />
                    </div>
                    <span style={{ color: "#fff" }}>{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: "#EE10B0", marginBottom: "0.5rem" }}>
                      <FaMusic size={24} />
                    </div>
                    <span>Click to select audio file</span>
                    <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>MP3, WAV, AAC, etc.</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#eee",
              fontWeight: "500",
              fontSize: "0.95rem"
            }}>
              Song Cover Image
            </label>
            <div style={{
              border: "1px dashed #444",
              borderRadius: "5px",
              padding: "1.5rem",
              textAlign: "center",
              backgroundColor: "#333",
              transition: "all 0.2s ease"
            }}>
              <input
                type="file"
                onChange={handleImageChange}
                required
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                style={{
                  display: "block",
                  cursor: "pointer",
                  color: "#aaa"
                }}
              >
                {imageFile ? (
                  <div>
                    <div style={{ color: "#EE10B0", marginBottom: "0.5rem" }}>
                      <FaCompactDisc size={24} />
                    </div>
                    <span style={{ color: "#fff" }}>{imageFile.name}</span>
                    <div style={{ marginTop: "1rem" }}>
                      <img 
                        src={URL.createObjectURL(imageFile)} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: "100%", 
                          maxHeight: "150px",
                          borderRadius: "5px"
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: "#EE10B0", marginBottom: "0.5rem" }}>
                      <FaCompactDisc size={24} />
                    </div>
                    <span>Click to select cover image</span>
                    <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>JPG, PNG, etc. (Recommended: 1000x1000)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#EE10B0",
              color: "#fff",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#FF1493"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#EE10B0"}
          >
            {loading ? (
              <>
                <span 
                  className="spinner-border spinner-border-sm" 
                  role="status" 
                  aria-hidden="true"
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    borderWidth: "0.15em"
                  }}
                ></span>
                Uploading...
              </>
            ) : (
              <>
                <FaMusic />
                Upload Song
              </>
            )}
          </Button>
        </form>
      </div>
    );
  };

  const AddAlbumForm = () => {
    const [title, setTitle] = useState("");
    const [coverImage, setCoverImage] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setErrorMessage(null);

      if (!title || !coverImage) {
        setErrorMessage("Please fill in all required fields!");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("coverImage", coverImage);

      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/albums/addAlbum", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to create album");
        }

        const data = await res.json();
        setAlbums([...albums, data.album]);
        alert("Album created successfully!");
        setTitle("");
        setCoverImage(null);
        setView("options");
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{
        backgroundColor: "#222",
        borderRadius: "10px",
        padding: "2rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        border: "1px solid #333"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "1px solid #333",
          paddingBottom: "1rem"
        }}>
          <h1 style={{ 
            color: "#EE10B0",
            fontSize: "1.8rem",
            fontWeight: "600",
            margin: "0"
          }}>
            Create New Album
          </h1>
          <button 
            onClick={() => setView("options")}
            style={{
              backgroundColor: "transparent",
              color: "#aaa",
              border: "1px solid #444",
              borderRadius: "5px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: "500",
              fontSize: "0.9rem"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#333"}
            onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Back
          </button>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: "#ff4444",
            color: "#fff",
            padding: "1rem",
            borderRadius: "5px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem"
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#eee",
              fontWeight: "500",
              fontSize: "0.95rem"
            }}>
              Album Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter album title"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "5px",
                border: "1px solid #444",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#eee",
              fontWeight: "500",
              fontSize: "0.95rem"
            }}>
              Album Cover Image
            </label>
            <div style={{
              border: "1px dashed #444",
              borderRadius: "5px",
              padding: "1.5rem",
              textAlign: "center",
              backgroundColor: "#333",
              transition: "all 0.2s ease"
            }}>
              <input
                type="file"
                onChange={(e) => setCoverImage(e.target.files[0])}
                required
                accept="image/*"
                style={{ display: "none" }}
                id="album-cover-upload"
              />
              <label 
                htmlFor="album-cover-upload"
                style={{
                  display: "block",
                  cursor: "pointer",
                  color: "#aaa"
                }}
              >
                {coverImage ? (
                  <div>
                    <div style={{ color: "#EE10B0", marginBottom: "0.5rem" }}>
                      <FaCompactDisc size={24} />
                    </div>
                    <span style={{ color: "#fff" }}>{coverImage.name}</span>
                    <div style={{ marginTop: "1rem" }}>
                      <img 
                        src={URL.createObjectURL(coverImage)} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: "100%", 
                          maxHeight: "150px",
                          borderRadius: "5px"
                        }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: "#EE10B0", marginBottom: "0.5rem" }}>
                      <FaCompactDisc size={24} />
                    </div>
                    <span>Click to select cover image</span>
                    <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>JPG, PNG, etc. (Recommended: 1000x1000)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#EE10B0",
              color: "#fff",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#FF1493"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#EE10B0"}
          >
            {loading ? (
              <>
                <span 
                  className="spinner-border spinner-border-sm" 
                  role="status" 
                  aria-hidden="true"
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    borderWidth: "0.15em"
                  }}
                ></span>
                Creating...
              </>
            ) : (
              <>
                <FaCompactDisc />
                Create Album
              </>
            )}
          </Button>
        </form>
      </div>
    );
  };

  return (
    <div className="container-fluid" style={{
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {view === "options" && renderOptions()}
          {view === "song" && <AddSongForm />}
          {view === "album" && <AddAlbumForm />}
        </div>
      </div>
    </div>
  );
}
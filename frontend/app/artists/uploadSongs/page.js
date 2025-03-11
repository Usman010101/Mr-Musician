"use client";

import { useState } from "react";
import Input from "@/components/Input/Input"; // Reusable Input component
import Button from "@/components/Button/Button"; // Reusable Button component

export default function UploadSongs() {
  const [file, setFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Check if all required fields are filled out
    if (!file || !imageFile || !title || !genre) {
      setErrorMessage("Please fill in all fields and upload both files!");
      return;
    }

    // Prepare FormData for submission
    const formData = new FormData();
    formData.append("song", file); // 'song' matches the backend field name
    formData.append("image", imageFile); // 'image' matches the backend field name
    formData.append("title", title);
    formData.append("genre", genre);

    try {
      const res = await fetch("http://localhost:5000/api/upload/song", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Attach JWT token
        },
        body: formData,
      });

      if (res.ok) {
        alert("Song uploaded successfully!");
        // Optionally reset form after success
        setFile(null);
        setImageFile(null);
        setTitle("");
        setGenre("");
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.message || "Error uploading song.");
      }
    } catch (err) {
      setErrorMessage("Something went wrong. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="container-fluid p-4" style={{ maxWidth: "1200px" }}>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card p-4" style={{ backgroundColor: "#222", color: "#fff" }}>
            <h1 className="text-center mb-4" style={{ color: "#EE10B0" }}>Upload Song</h1>

            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Song Title</label>
                <Input
                  type="text"
                  id="title"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter song title"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="genre" className="form-label">Genre</label>
                <Input
                  type="text"
                  id="genre"
                  className="form-control"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Enter genre"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="song" className="form-label">Song File</label>
                <div className="input-group">
                  <Input
                    type="file"
                    id="song"
                    className="form-control"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="image" className="form-label">Image File</label>
                <div className="input-group">
                  <Input
                    type="file"
                    id="image"
                    className="form-control"
                    onChange={handleImageChange}
                    required
                  />
                </div>
              </div>

              <Button
                className="btn btn-lg btn-pink w-100"
                style={{ backgroundColor: "#EE10B0", borderColor: "#EE10B0" }}
              >
                Upload Song
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

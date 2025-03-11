import { usePlayer } from "@/app/context/PlayerContext"
import React from "react";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
  FaRedo,
  FaVolumeUp,
} from "react-icons/fa";


export default function PlayerBar() {
  const { state, actions } = usePlayer();

  // Calculate percentage for the progress bar
  const progressPercent = state.duration ? (state.progress / state.duration) * 100 : 0;

  // Utility function to format time in mm:ss
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="container-fluid d-flex justify-content-between align-items-center  p-3 border-top">
      {/* Left Section: Song Info */}
      <section className="d-flex align-items-center" style={{ width: "30%" }}>
        <img
          src={state.currentTrack.cover}
          alt={state.currentTrack.title}
          style={{ width: 60, height: 60, objectFit: "cover" }}
        />
        <div className="ms-3">
          <h6 className="mb-0">{state.currentTrack.title}</h6>
          <small >{state.currentTrack.artist}</small>
        </div>
      </section>

      {/* Center Section: Controls and Progress Bar */}
      <section className="d-flex flex-column align-items-center" style={{ width: "40%" }}>
        <div className="d-flex align-items-center mb-2">
          <FaRandom className="mx-2" style={{ cursor: "pointer" }} />
          <FaStepBackward
            className="mx-2"
            style={{ cursor: "pointer" }}
            onClick={actions.prevTrack}
          />
          {state.isPlaying ? (
            <FaPause
              className="mx-2"
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={actions.pause}
            />
          ) : (
            <FaPlay
              className="mx-2"
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              onClick={actions.play}
            />
          )}
          <FaStepForward
            className="mx-2"
            style={{ cursor: "pointer" }}
            onClick={actions.nextTrack}
          />
          <FaRedo className="mx-2" style={{ cursor: "pointer", color: state.isRepeat ? "#00FF00" : "white"  }} onClick={actions.repeat} />
        </div>
        <div className="d-flex align-items-center w-100">
          <small>{formatTime(state.progress)}</small>
          <input
            type="range"
            className="form-range mx-2"
            style={{ flex: 1 }}
            min={0}
            max={state.duration || 0}
            value={state.progress}
            onChange={(e) => actions.seek(Number(e.target.value))}
          />
          <small>{formatTime(state.duration)}</small>
        </div>
      </section>

      {/* Right Section: Additional Controls (Volume) */}
      <section className="d-flex align-items-center justify-content-end" style={{ width: "30%" }}>
        <FaVolumeUp className="mx-2 " />
        <input
          type="range"
          className="form-range "
          style={{ width: "100px" }}
          min="0"
          max="1"
          step="0.01"
          value={state.volume}
          onChange={(e) => actions.setVolume(Number(e.target.value))}
        />
      </section>
    </div>
  );
}

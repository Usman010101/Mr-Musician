"use client";
import { useState, useEffect } from "react";
import { usePlayer } from "@/app/(listener)/context/PlayerContext";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
  FaRedo,
  FaVolumeUp,
  FaExpand,
  FaCompress
} from "react-icons/fa";
import style from "./Player.module.css";

export default function PlayerBar() {
  const { state, actions } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [looping, setLooping] = useState(false);
  const [localVolume, setLocalVolume] = useState(state.volume);

  // Handle audio looping
  useEffect(() => {
    if (!looping) return;

    const interval = setInterval(() => {
      if (state.progress >= loopEnd) {
        actions.seek(loopStart);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [looping, loopStart, loopEnd, actions, state.progress]);

  // Sync volume changes
  useEffect(() => {
    const timer = setTimeout(() => {
      actions.setVolume(localVolume);
    }, 100);
    return () => clearTimeout(timer);
  }, [localVolume, actions]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={style.stickyPlayer}>
      {!expanded && (<>
        {/* Left Section: Song Info */}
        <section className="d-flex align-items-center" style={{ width: "30%" }}>
          <img
            src={state.currentTrack?.cover || '/default-cover.jpg'}
            alt={state.currentTrack?.title}
            style={{ width: 60, height: 60, objectFit: "cover" }}
          />
          <div className="ms-3">
            <h6 className="mb-0">{state.currentTrack?.title || 'No track playing'}</h6>
            <small>{state.currentTrack?.artist || 'Unknown artist'}</small>
          </div>
        </section>

        {/* Center Section: Controls and Progress Bar */}
        <section className="d-flex flex-column align-items-center" style={{ width: "40%" }}>
          <div className="d-flex align-items-center mb-2">
            <FaRandom className="mx-2 fs-4" style={{ cursor: "pointer" }} />
            <FaStepBackward
              className="mx-2"
              style={{ cursor: "pointer" }}
              onClick={actions.prevTrack}
            />
            {state.isPlaying ? (
              <FaPause
                className="mx-2 fs-4"
                style={{ cursor: "pointer", fontSize: "1.5rem" }}
                onClick={actions.pause}
              />
            ) : (
              <FaPlay
                className="mx-2 fs-4"
                style={{ cursor: "pointer", fontSize: "1.5rem" }}
                onClick={actions.play}
              />
            )}
            <FaStepForward
              className="mx-2 fs-4"
              style={{ cursor: "pointer" }}
              onClick={actions.nextTrack}
            />
            <FaRedo
              className="mx-2 fs-4"
              style={{ cursor: "pointer", color: state.isRepeat ? "#00FF00" : "white" }}
              onClick={actions.repeat}
            />
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

        {/* Right Section: Additional Controls */}
        <section className="d-flex align-items-center justify-content-end" style={{ width: "30%" }}>
          <FaExpand
            className={style.controlButton}
            onClick={() => setExpanded(!expanded)}
          />
          <div className="d-flex align-items-center mx-2">
            <FaVolumeUp className={style.controlButton} />
            <input
              type="range"
              className="form-range ms-2"
              style={{ width: "100px" }}
              min="0"
              max="1"
              step="0.01"
              value={localVolume}
              onChange={(e) => setLocalVolume(Number(e.target.value))}
            />
          </div>
        </section>
      </>)}

      {/* Expanded View Modal */}
      {expanded && (
        <div className={style.overlay}>
          <div className={style.modal}>
            <div className={style.expandedHeader}>
              <h3>{state.currentTrack?.title}</h3>
              <button onClick={() => setExpanded(false)} className={style.closeButton}>
                <FaCompress />
              </button>
            </div>
            <div className={style.expandedContent}>
              <div className={style.playerSection}>
                <img
                  src={state.currentTrack?.cover || '/default-cover.jpg'}
                  alt="cover"
                  className={style.expandedCoverArt}
                />
                <div className={style.playbackControls}>
                  <FaStepBackward
                    className="mx-2 fs-3"
                    style={{ cursor: "pointer" }}
                    onClick={actions.prevTrack}
                  />
                  {state.isPlaying ? (
                    <FaPause
                className="mx-2 fs-3"
                style={{ cursor: "pointer", fontSize: "1.5rem" }}
                onClick={actions.pause}
              />
                  ) : (
                     <FaPlay
                className="mx-2 fs-3"
                style={{ cursor: "pointer", fontSize: "1.5rem" }}
                onClick={actions.play}
              />
                  )}
                  <FaStepForward
              className="mx-2 fs-3"
              style={{ cursor: "pointer" }}
              onClick={actions.nextTrack}
            />
                  <button
                    onClick={actions.repeat}
                    className={`${style.controlButton} ${state.isRepeat ? style.active : ''}`}
                  >
                    <FaRedo
              className="mx-2 fs-3"
              style={{ cursor: "pointer", color: state.isRepeat ? "#00FF00" : "white" }}
              onClick={actions.repeat}
            />
                  </button>
                </div>
                <div className={style.progressContainer}>
                  <span className={style.timeDisplay}>{formatTime(state.progress)}</span>
                  <input
                    type="range"
                    className={style.progressBar}
                    min={0}
                    max={state.duration}
                    value={state.progress}
                    onChange={(e) => actions.seek(Number(e.target.value))}
                  />
                  <span className={style.timeDisplay}>{formatTime(state.duration)}</span>
                </div>
                <div className={style.loopSectionControls}>
                  <button onClick={() => setLoopStart(state.progress)}>
                    Set Start: {formatTime(loopStart)}
                  </button>
                  <button onClick={() => setLoopEnd(state.progress)}>
                    Set End: {formatTime(loopEnd)}
                  </button>
                  <button
                    onClick={() => setLooping(!looping)}
                    className={looping ? style.active : ''}
                  >
                    
                    {looping ? 'Stop Looping' : 'Start Looping'}
                  </button>
                </div>
              </div>
              <div className={style.queueSection}>
                <h4>Up Next</h4>
                <div className={style.queueList}>
                  {state.queue.map((track, index) => (
                    <div
                      key={index}
                      className={`${style.queueItem} ${index === state.currentQueueIndex ? style.activeQueueItem : ''}`}
                      onClick={() => actions.setTrack(track)}
                    >
                      <img
                        src={track.cover || '/default-cover.jpg'}
                        alt="cover"
                        className={style.queueCover}
                      />
                      <div className={style.queueInfo}>
                        <span>{track.title}</span>
                        <small>{track.artist}</small>
                      </div>
                      <div className={style.queueDuration}>
                        {formatTime(track.duration || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
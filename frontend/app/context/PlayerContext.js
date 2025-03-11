'use client'
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Create the Player Context
const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [state, setState] = useState({
    currentTrack: {
      title: "Sample Song",
      artist: "Sample Artist",
      cover: "/default-cover.png",
      src: "/sample-audio.mp3",
    },
    isPlaying: false,
    volume: 0.5,
    progress: 0,
    duration: 0,
    isRepeat:false
  });

  // Sync audio volume with state
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = state.volume;
  }, [state.volume]);

  // Update progress during playback
  useEffect(() => {
    const updateProgress = () => {
      setState((prev) => ({
        ...prev,
        progress: audioRef.current?.currentTime || 0,
      }));
    };

    audioRef.current?.addEventListener("timeupdate", updateProgress);
    return () => audioRef.current?.removeEventListener("timeupdate", updateProgress);
  }, []);

  const actions = {
    play: () => {
      if (!audioRef.current) return;
      audioRef.current.play();
      setState((prev) => ({ ...prev, isPlaying: true }));
    },
    pause: () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    },
    togglePlay: () => {
      state.isPlaying ? actions.pause() : actions.play();
    },
    setVolume: (volume) => {
      setState((prev) => ({ ...prev, volume }));
    },
    seek: (time) => {
      if (audioRef.current) audioRef.current.currentTime = time;
      setState((prev) => ({ ...prev, progress: time }));
    },
    setTrack:(newTrack)=>{
        setState((prev)=>({
          ...prev,
          currentTrack:newTrack,
          progress:0
        }));
        if(audioRef.current){
          audioRef.current.load();
        }
    },
    repeat:()=>{
      if(audioRef.current){
        audioRef.current.loop=!audioRef.current.loop;
        setState((prev)=>({
          ...prev,
          isRepeat:audioRef.current.loop
        }));
      }
    }
  };

  // Update track duration when metadata is loaded
  useEffect(() => {
    const setDuration = () => {
      setState((prev) => ({
        ...prev,
        duration: audioRef.current?.duration || 0,
      }));
    };
    audioRef.current?.addEventListener("loadedmetadata", setDuration);
    return () => audioRef.current?.removeEventListener("loadedmetadata", setDuration);
  }, []);

  return (
    <PlayerContext.Provider value={{ state, actions }}>
      {children}
      <audio ref={audioRef} src={state.currentTrack.src} />
    </PlayerContext.Provider>
  );
};

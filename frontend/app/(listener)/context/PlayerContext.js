'use client'
import { createContext, useContext, useEffect, useRef, useState } from "react";

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
    currentTrack: null,
    isPlaying: false,
    volume: 0.5,
    progress: 0,
    duration: 0,
    isRepeat: false,
    isQueueLoading: false,
    currentQueuePage: 1,
    queue: [],          // Forward queue (next songs)
    history: [],        // Backward history (previous songs)
    currentIndex: -1,   // Current position in queue
    historyIndex: -1    // Current position in history
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

  const fetchRecommendedSongs = async (genre, page = 1) => {
    try {
      setState(prev => ({ ...prev, isQueueLoading: true }));
      const response = await fetch(`http://localhost:5000/api/listeners/getpaginaatedSongs?genre=${genre}&page=${page}&limit=3`);
      const data = await response.json();
      return data.songs;
    } catch (error) {
      console.error("Error fetching recommended songs:", error);
      return [];
    } finally {
      setState(prev => ({ ...prev, isQueueLoading: false }));
    }
  };

  const loadMoreSongs = async () => {
    if (state.isQueueLoading || !state.currentTrack?.genre) return;
    
    const newSongs = await fetchRecommendedSongs(
      state.currentTrack.genre, 
      state.currentQueuePage
    );

    if (newSongs.length > 0) {
      setState(prev => ({
        ...prev,
        queue: [...prev.queue, ...newSongs],
        currentQueuePage: prev.currentQueuePage + 1
      }));
    }
  };

  // Load more songs when queue is running low
  useEffect(() => {
    if (state.queue.length - state.currentIndex <= 2) {
      loadMoreSongs();
    }
  }, [state.currentIndex, state.queue.length]);

  // Handle track ending
  useEffect(() => {
    const handleEnded = () => {
      if (state.isRepeat) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        actions.next();
      }
    };

    audioRef.current?.addEventListener('ended', handleEnded);
    return () => audioRef.current?.removeEventListener('ended', handleEnded);
  }, [state.isRepeat, state.queue, state.currentIndex]);

  const actions = {
    play: async () => {
      if (!audioRef.current) return;
      try {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      } catch (err) {
        console.error("Error playing audio:", err);
      }
    },
    
    pause: () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    },
    
    togglePlay: () => {
      state.isPlaying ? actions.pause() : actions.play();
    },
    
    setVolume: (volume) => {
      setState(prev => ({ ...prev, volume }));
    },
    
    seek: (time) => {
      if (audioRef.current) audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, progress: time }));
    },
    
    setTrack: async (track) => {
      // Add current track to history if exists
      const newHistory = state.currentTrack 
        ? [...state.history, state.currentTrack] 
        : state.history;
      
      setState(prev => ({
        ...prev,
        currentTrack: track,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        queue: [], // Reset forward queue
        currentIndex: -1,
        progress: 0,
        isPlaying: false,
        currentQueuePage: 1
      }));
      
      if (audioRef.current) {
        await audioRef.current.load();
        actions.play();
      }
    },
    
    repeat: () => {
      if (audioRef.current) {
        audioRef.current.loop = !audioRef.current.loop;
        setState(prev => ({
          ...prev,
          isRepeat: audioRef.current.loop
        }));
      }
    },
    
    next: async () => {
      // If we have queued songs, play the next one
      if (state.currentIndex < state.queue.length - 1) {
        const nextIndex = state.currentIndex + 1;
        const nextTrack = state.queue[nextIndex];
        
        setState(prev => ({
          ...prev,
          currentTrack: nextTrack,
          history: [...prev.history, prev.currentTrack],
          historyIndex: prev.history.length, // Points to newly added track
          currentIndex: nextIndex,
          progress: 0,
          isPlaying: false,
        }));
      } 
      // Else try to load more songs
      else {
        await loadMoreSongs();
        if (state.queue.length > 0) {
          actions.next();
        } else {
          actions.pause();
        }
      }
      
      if (audioRef.current) {
        await audioRef.current.load();
        actions.play();
      }
    },
    
    previous: async () => {
      // If we have history to go back to
      if (state.historyIndex >= 0) {
        const prevTrack = state.history[state.historyIndex];
        
        setState(prev => ({
          ...prev,
          currentTrack: prevTrack,
          historyIndex: prev.historyIndex - 1,
          // Add current track to beginning of queue
          queue: [prev.currentTrack, ...prev.queue],
          currentIndex: 0,
          progress: 0,
          isPlaying: false,
        }));
        
        if (audioRef.current) {
          await audioRef.current.load();
          actions.play();
        }
      } 
      // Else restart current track if >3 seconds played
      else if (state.progress > 3) {
        actions.seek(0);
      }
    },
    
    addToQueue: (track) => {
      setState(prev => ({
        ...prev,
        queue: [...prev.queue, track]
      }));
    },
    
    playTrackAndClearQueue: async (track) => {
      setState(prev => ({
        ...prev,
        currentTrack: track,
        history: [...prev.history, prev.currentTrack],
        historyIndex: prev.history.length,
        queue: [],
        currentIndex: -1,
        progress: 0,
        isPlaying: false,
        currentQueuePage: 1,
      }));
      
      if (audioRef.current) {
        await audioRef.current.load();
        actions.play();
      }
    },
    
    playCollection: async (tracks, startIndex = 0) => {
      if (tracks.length === 0) return;
      
      setState(prev => ({
        ...prev,
        currentTrack: tracks[startIndex],
        history: [...prev.history, prev.currentTrack],
        historyIndex: prev.history.length,
        queue: tracks.slice(startIndex + 1),
        currentIndex: 0,
        progress: 0,
        isPlaying: false,
        currentQueuePage: 1,
      }));
      
      if (audioRef.current) {
        await audioRef.current.load();
        actions.play();
      }
    }
  };

  // Update track duration when metadata is loaded
  useEffect(() => {
    const setDuration = () => {
      setState(prev => ({
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
      <audio ref={audioRef} src={state.currentTrack?.src} />
    </PlayerContext.Provider>
  );
};
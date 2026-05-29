import { useState, useCallback, useRef, useEffect } from 'react';
import { ITrack } from '@/types';
import { mcpAudioService } from '@/services/MCPAudioService';

interface AudioPlayerState {
  currentTrack: ITrack | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isMinimized: boolean;
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const useAudioPlayer = () => {
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    volume: 80,
    isShuffled: false,
    repeatMode: 'off',
    isMinimized: false,
  });

  const [upNext, setUpNext] = useState<ITrack[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);
  const upNextRef = useRef<ITrack[]>([]);
  const playHistoryRef = useRef<ITrack[]>([]);
  const stateRef = useRef(state);
  const playTrackRef = useRef<(track: ITrack, options?: { skipHistory?: boolean }) => Promise<void>>(
    async () => {}
  );
  const advanceToNextRef = useRef<() => void>(() => {});

  stateRef.current = state;

  const syncUpNext = useCallback((tracks: ITrack[]) => {
    upNextRef.current = tracks;
    setUpNext(tracks);
  }, []);

  const clearSimulation = useCallback(() => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
  }, []);

  const startSimulation = useCallback(
    (onComplete: () => void) => {
      let simulatedProgress = 0;
      simulationInterval.current = setInterval(() => {
        simulatedProgress += 1;
        setState((prev) => ({ ...prev, progress: simulatedProgress }));

        if (simulatedProgress >= 100) {
          clearSimulation();
          onComplete();
        }
      }, 250);
    },
    [clearSimulation]
  );

  const advanceToNext = useCallback(() => {
    const current = stateRef.current;
    const queue = upNextRef.current;

    if (current.repeatMode === 'one' && current.currentTrack) {
      playTrackRef.current(current.currentTrack, { skipHistory: true });
      return;
    }

    if (queue.length > 0) {
      const [next, ...rest] = queue;
      syncUpNext(rest);
      if (current.currentTrack) {
        playHistoryRef.current = [...playHistoryRef.current, current.currentTrack].slice(-50);
      }
      playTrackRef.current(next, { skipHistory: true });
      return;
    }

    if (current.repeatMode === 'all' && current.currentTrack) {
      playTrackRef.current(current.currentTrack, { skipHistory: true });
      return;
    }

    setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
  }, [syncUpNext]);

  advanceToNextRef.current = advanceToNext;

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();

    const audio = audioRef.current;

    const handleEnded = () => {
      advanceToNextRef.current();
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      clearSimulation();
    };
  }, [clearSimulation]);

  // Update progress
  useEffect(() => {
    if (state.isPlaying && audioRef.current) {
      progressInterval.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio && audio.duration) {
          const currentProgress = (audio.currentTime / audio.duration) * 100;
          setState((prev) => ({ ...prev, progress: currentProgress }));
        }
      }, 250);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (!state.isPlaying) {
        clearSimulation();
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [state.isPlaying, clearSimulation]);

  const playTrack = useCallback(
    async (track: ITrack, options?: { skipHistory?: boolean }) => {
      clearSimulation();

      const current = stateRef.current;

      if (current.currentTrack?.id === track.id) {
        setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
        if (current.isPlaying) {
          audioRef.current?.pause();
        } else if (audioRef.current && current.currentTrack?.preview_url) {
          audioRef.current.play().catch(console.error);
        } else if (!current.currentTrack?.preview_url) {
          startSimulation(() => advanceToNextRef.current());
          setState((prev) => ({ ...prev, isPlaying: true }));
        }
        return;
      }

      if (current.currentTrack && !options?.skipHistory) {
        playHistoryRef.current = [...playHistoryRef.current, current.currentTrack].slice(-50);
      }

      setState((prev) => ({
        ...prev,
        currentTrack: track,
        isPlaying: true,
        progress: 0,
      }));

      try {
        let enhancedTrack: ITrack;
        if (track.preview_url) {
          enhancedTrack = track;
        } else {
          enhancedTrack = await mcpAudioService.enhanceTrackWithPreview(track);
        }

        setState((prev) => ({
          ...prev,
          currentTrack: enhancedTrack,
        }));

        if (audioRef.current && enhancedTrack.preview_url) {
          const audio = audioRef.current;
          audio.src = enhancedTrack.preview_url;
          audio.volume = stateRef.current.volume / 100;

          try {
            await audio.play();
          } catch {
            startSimulation(() => advanceToNextRef.current());
          }
        } else {
          startSimulation(() => advanceToNextRef.current());
        }
      } catch {
        startSimulation(() => advanceToNextRef.current());
      }
    },
    [clearSimulation, startSimulation]
  );

  playTrackRef.current = playTrack;

  const addToQueue = useCallback(
    (track: ITrack, options?: { openPanel?: boolean }) => {
      const openPanel = options?.openPanel ?? true;
      const currentId = stateRef.current.currentTrack?.id;

      if (track.id === currentId) return;

      setUpNext((prev) => {
        if (prev.some((t) => t.id === track.id)) return prev;
        const next = [...prev, track];
        upNextRef.current = next;
        return next;
      });

      if (openPanel) setIsQueueOpen(true);
    },
    []
  );

  const removeFromQueue = useCallback(
    (trackId: string) => {
      setUpNext((prev) => {
        const next = prev.filter((t) => t.id !== trackId);
        upNextRef.current = next;
        return next;
      });
    },
    []
  );

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setUpNext((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      upNextRef.current = next;
      return next;
    });
  }, []);

  const moveQueueItem = useCallback((index: number, direction: 'up' | 'down') => {
    setUpNext((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      upNextRef.current = next;
      return next;
    });
  }, []);

  const clearQueue = useCallback(() => {
    syncUpNext([]);
  }, [syncUpNext]);

  const playFromQueue = useCallback(
    (track: ITrack) => {
      removeFromQueue(track.id);
      playTrack(track);
    },
    [removeFromQueue, playTrack]
  );

  const openQueue = useCallback(() => setIsQueueOpen(true), []);
  const closeQueue = useCallback(() => setIsQueueOpen(false), []);
  const toggleQueue = useCallback(() => setIsQueueOpen((open) => !open), []);

  const isInQueue = useCallback(
    (trackId: string) => {
      if (state.currentTrack?.id === trackId) return true;
      return upNext.some((t) => t.id === trackId);
    },
    [state.currentTrack?.id, upNext]
  );

  const togglePlay = useCallback(() => {
    if (!stateRef.current.currentTrack) return;

    const current = stateRef.current;

    if (current.isPlaying) {
      audioRef.current?.pause();
      clearSimulation();
    } else {
      if (audioRef.current && current.currentTrack?.preview_url) {
        audioRef.current.play().catch(console.error);
      } else if (current.currentTrack) {
        startSimulation(() => advanceToNextRef.current());
      }
    }

    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [clearSimulation, startSimulation]);

  const skipNext = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  const skipPrevious = useCallback(() => {
    const current = stateRef.current;
    if (!current.currentTrack) return;

    if (current.progress > 3) {
      setState((prev) => ({ ...prev, progress: 0 }));
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const history = playHistoryRef.current;
    if (history.length > 0) {
      const previous = history[history.length - 1];
      playHistoryRef.current = history.slice(0, -1);
      if (current.currentTrack) {
        const queue = upNextRef.current;
        syncUpNext([current.currentTrack, ...queue]);
      }
      playTrack(previous, { skipHistory: true });
    }
  }, [playTrack, syncUpNext]);

  const seek = useCallback((position: number) => {
    setState((prev) => ({ ...prev, progress: position }));

    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (position / 100) * audioRef.current.duration;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume }));

    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      const nextShuffled = !prev.isShuffled;
      if (nextShuffled && upNextRef.current.length > 1) {
        syncUpNext(shuffleArray(upNextRef.current));
      }
      return { ...prev, isShuffled: nextShuffled };
    });
  }, [syncUpNext]);

  const toggleRepeat = useCallback(() => {
    setState((prev) => {
      const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(prev.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      return { ...prev, repeatMode: nextMode };
    });
  }, []);

  const toggleFavorite = useCallback(() => {
    // Placeholder for favorites
  }, []);

  const toggleMinimize = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    clearSimulation();
    syncUpNext([]);
    playHistoryRef.current = [];

    setState({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      volume: 80,
      isShuffled: false,
      repeatMode: 'off',
      isMinimized: false,
    });
  }, [clearSimulation, syncUpNext]);

  return {
    currentTrack: state.currentTrack,
    isPlaying: state.isPlaying,
    progress: state.progress,
    volume: state.volume,
    isShuffled: state.isShuffled,
    repeatMode: state.repeatMode,
    isMinimized: state.isMinimized,
    upNext,
    isQueueOpen,
    playTrack,
    togglePlay,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    toggleMinimize,
    closePlayer,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    moveQueueItem,
    clearQueue,
    playFromQueue,
    openQueue,
    closeQueue,
    toggleQueue,
    isInQueue,
  };
};

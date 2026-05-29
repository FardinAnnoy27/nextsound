import React from 'react';
import { MiniPlayer } from './MiniPlayer';
import { QueuePanel } from './QueuePanel';
import { useAudioPlayerContext } from '@/context/audioPlayerContext';

export const PlayerShell: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    isShuffled,
    repeatMode,
    isMinimized,
    upNext,
    togglePlay,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    toggleMinimize,
    toggleQueue,
  } = useAudioPlayerContext();

  return (
    <>
      <MiniPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progress={progress}
        volume={volume}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        isMinimized={isMinimized}
        queueCount={upNext.length}
        onTogglePlay={togglePlay}
        onSkipPrevious={skipPrevious}
        onSkipNext={skipNext}
        onSeek={seek}
        onVolumeChange={setVolume}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onToggleFavorite={toggleFavorite}
        onToggleMinimize={toggleMinimize}
        onOpenQueue={toggleQueue}
      />
      <QueuePanel />
    </>
  );
};

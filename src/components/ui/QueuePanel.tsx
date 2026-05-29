import React, { useCallback, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { FiX, FiPlay, FiPause, FiTrash2 } from 'react-icons/fi';
import { Button } from './button';
import { QueueListItem } from './QueueListItem';
import Overlay from '@/common/Overlay';
import { useAudioPlayerContext } from '@/context/audioPlayerContext';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useMotion } from '@/hooks/useMotion';
import { getImageUrl, cn } from '@/utils';

export const QueuePanel: React.FC = () => {
  const {
    isQueueOpen,
    closeQueue,
    currentTrack,
    isPlaying,
    togglePlay,
    upNext,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    playFromQueue,
  } = useAudioPlayerContext();

  const { slideIn } = useMotion();

  const handleClose = useCallback(() => {
    closeQueue();
  }, [closeQueue]);

  const { ref } = useOnClickOutside({
    action: handleClose,
    enable: isQueueOpen,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQueueOpen) {
        closeQueue();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isQueueOpen, closeQueue]);

  const nowPlayingTitle =
    currentTrack?.original_title ||
    currentTrack?.name ||
    currentTrack?.title ||
    'Nothing playing';

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <Overlay className="z-40">
          <m.aside
            ref={ref}
            variants={slideIn('right', 'tween', 0, 0.25)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={cn(
              'fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col',
              'bg-white dark:bg-card-dark shadow-2xl border-l border-gray-200 dark:border-gray-800'
            )}
            role="dialog"
            aria-label="Playback queue"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                  Queue
                </h2>
                {upNext.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-text-secondary mt-0.5">
                    {upNext.length} upcoming
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="Close queue"
              >
                <FiX className="w-5 h-5" />
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <section className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-orange mb-3">
                  Now playing
                </p>
                {currentTrack ? (
                  <div className="flex gap-4 items-center">
                    <img
                      src={getImageUrl(currentTrack.poster_path)}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover shadow-md shrink-0 dark:brightness-90"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-text-primary truncate text-base">
                        {nowPlayingTitle}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-text-secondary truncate mt-1">
                        {currentTrack.artist || 'Unknown Artist'}
                      </p>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="mt-3 gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100"
                        onClick={togglePlay}
                      >
                        {isPlaying ? (
                          <>
                            <FiPause className="w-4 h-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <FiPlay className="w-4 h-4" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-text-secondary">
                    No track playing. Add songs from the library or play a track.
                  </p>
                )}
              </section>

              <section className="px-3 py-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-text-muted">
                    Up next
                  </p>
                  {upNext.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-gray-500 hover:text-red-500"
                      onClick={clearQueue}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      Clear
                    </Button>
                  )}
                </div>

                {upNext.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-text-secondary px-2 py-6 text-center">
                    Nothing queued. Use &ldquo;Add to Queue&rdquo; on any song.
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {upNext.map((track, index) => (
                      <li key={track.id}>
                        <QueueListItem
                          track={track}
                          index={index}
                          totalCount={upNext.length}
                          onPlay={playFromQueue}
                          onRemove={removeFromQueue}
                          onMove={moveQueueItem}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </m.aside>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

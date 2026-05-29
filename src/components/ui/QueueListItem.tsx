import React from 'react';
import { FiChevronUp, FiChevronDown, FiX, FiPlay } from 'react-icons/fi';
import { Button } from './button';
import { ITrack } from '@/types';
import { getImageUrl, cn } from '@/utils';

interface QueueListItemProps {
  track: ITrack;
  index: number;
  totalCount: number;
  onPlay: (track: ITrack) => void;
  onRemove: (trackId: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

export const QueueListItem: React.FC<QueueListItemProps> = ({
  track,
  index,
  totalCount,
  onPlay,
  onRemove,
  onMove,
}) => {
  const title = track.original_title || track.name || track.title || 'Unknown Track';

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-2 py-2',
        'hover:bg-gray-100 dark:hover:bg-hover-gray transition-colors'
      )}
    >
      <span className="w-5 text-xs text-gray-400 dark:text-text-muted tabular-nums shrink-0">
        {index + 1}
      </span>

      <button
        type="button"
        onClick={() => onPlay(track)}
        className="flex items-center gap-3 min-w-0 flex-1 text-left"
        aria-label={`Play ${title}`}
      >
        <img
          src={getImageUrl(track.poster_path)}
          alt=""
          className="w-10 h-10 rounded-md object-cover shrink-0 dark:brightness-90"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-text-primary truncate">
            {title}
          </p>
          <p className="text-xs text-gray-500 dark:text-text-secondary truncate">
            {track.artist || 'Unknown Artist'}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={index === 0}
          onClick={() => onMove(index, 'up')}
          aria-label="Move up"
        >
          <FiChevronUp className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={index === totalCount - 1}
          onClick={() => onMove(index, 'down')}
          aria-label="Move down"
        >
          <FiChevronDown className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPlay(track)}
          aria-label="Play now"
        >
          <FiPlay className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-red-500"
          onClick={() => onRemove(track.id)}
          aria-label="Remove from queue"
        >
          <FiX className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

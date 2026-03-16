'use client';

import { Source } from '@/lib/models';

interface SourceCardProps {
  source: Source;
  onOpen: (source: Source) => void;
}

export default function SourceCard({ source, onOpen }: SourceCardProps) {
  const typeColors = {
    m3u8: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    mp4: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    embed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-medium text-zinc-900 dark:text-white">{source.name}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${typeColors[source.type]}`}>
            {source.type.toUpperCase()}
          </span>
        </div>
      </div>
      <button
        onClick={() => onOpen(source)}
        className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Open
      </button>
    </div>
  );
}

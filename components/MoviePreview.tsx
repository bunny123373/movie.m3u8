'use client';

import Image from 'next/image';

interface MoviePreviewProps {
  title: string;
  poster: string;
  overview: string;
  rating: number;
  releaseDate: string;
}

export default function MoviePreview({ title, poster, overview, rating, releaseDate }: MoviePreviewProps) {
  const year = releaseDate.split('-')[0];

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
      <div className="w-40 h-60 shrink-0 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700">
        {poster && (
          <Image
            src={poster}
            alt={title}
            width={160}
            height={240}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 space-y-3">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{year}</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {rating.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3">{overview || 'No overview available'}</p>
      </div>
    </div>
  );
}

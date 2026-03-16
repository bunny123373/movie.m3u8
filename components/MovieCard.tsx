'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Source {
  id: string;
  name: string;
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
  priority: number;
  active: boolean;
}

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    poster: string;
    backdrop: string;
    rating: number;
    releaseDate: string;
    overview: string;
    genres: string[];
    audioLanguages: string[];
    subtitleLanguages: string[];
    quality: string;
    runtime?: string;
    fileSize?: string;
    mediaType?: 'movie' | 'series';
    totalSeasons?: number;
    totalEpisodes?: number;
    sources: Source[];
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const year = movie.releaseDate.split('-')[0];
  const activeSources = movie.sources.filter(s => s.active).length;

  return (
    <Link href={`/movie/${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-zinc-900 dark:text-white truncate">{movie.title}</h3>
        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{year}</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {movie.rating}
          </span>
          <span>{activeSources} {activeSources === 1 ? 'Source' : 'Sources'}</span>
        </div>
      </div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 space-y-2">
        <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

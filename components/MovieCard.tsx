'use client';

import { useState } from 'react';
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

interface CardMedia {
  id: string;
  slug?: string;
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
}

interface FavoriteItem {
  id: string;
}

interface WatchProgress {
  progress: number;
  duration: number;
}

interface MovieCardProps {
  movie: CardMedia;
  className?: string;
  progress?: WatchProgress;
}

function readFavorites(): FavoriteItem[] {
  try {
    const stored = localStorage.getItem('favorites');
    if (!stored) {
      return [];
    }
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as FavoriteItem[];
  } catch (error) {
    console.error('Failed to read favorites:', error);
    return [];
  }
}

export default function MovieCard({ movie, className, progress }: MovieCardProps) {
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return readFavorites().some((item) => item.id === movie.id);
  });
  const year = movie.releaseDate.split('-')[0];
  const linkSlug = movie.slug || movie.id;
  const cardClassName = className || 'w-[220px] sm:w-[260px] shrink-0';

  const toggleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const favorites = readFavorites();
    if (favorites.some((item) => item.id === movie.id)) {
      const updated = favorites.filter((item) => item.id !== movie.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
      return;
    }

    const updated = [
      ...favorites,
      {
        id: movie.id,
        slug: movie.slug,
        title: movie.title,
        poster: movie.poster,
        mediaType: movie.mediaType || 'movie',
      },
    ];
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(true);
  };

  return (
    <Link href={`/movie/${linkSlug}`} className={`group block ${cardClassName}`}>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#101922] shadow-[0_16px_30px_-24px_rgba(0,0,0,0.9)] transition-all duration-300 group-hover:border-[#00a8e1]/55 group-hover:shadow-[0_20px_34px_-18px_rgba(0,168,225,0.35)]">
        <Image
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 260px"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#09121a] via-[#09121a]/30 to-transparent" />

        <div className="absolute left-2 right-2 top-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-slate-100">
              {movie.quality}
            </span>
            {progress && (
              <span className="rounded-md bg-[#00a8e1]/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                {Math.round((progress.progress / progress.duration) * 100)}%
              </span>
            )}
          </div>
          <button
            onClick={toggleFavorite}
            className="rounded-full bg-black/55 p-1.5 text-slate-100 transition-colors hover:bg-black/75"
          >
            <svg
              className={`h-4 w-4 ${isFavorite ? 'text-red-400' : 'text-slate-100'}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {progress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div 
              className="h-full bg-[#00a8e1]" 
              style={{ width: `${(progress.progress / progress.duration) * 100}%` }}
            />
          </div>
        )}
      </div>
      <div className="mt-2 px-1">
        <h3 className="truncate text-sm font-medium text-white">{movie.title}</h3>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
          <span>{year}</span>
          <span className="text-yellow-500">★ {movie.rating.toFixed(1)}</span>
          {movie.mediaType === 'series' && movie.totalSeasons && (
            <span>{movie.totalSeasons} Seasons</span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface MovieCardSkeletonProps {
  className?: string;
}

export function MovieCardSkeleton({ className }: MovieCardSkeletonProps) {
  const cardClassName = className || 'w-[220px] sm:w-[260px] shrink-0';

  return (
    <div className={`animate-pulse ${cardClassName}`}>
      <div className="aspect-video rounded-xl border border-white/10 bg-[#1a2430]" />
    </div>
  );
}

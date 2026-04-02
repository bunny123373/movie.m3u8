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
  slug?: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'series';
}

interface WatchProgress {
  progress: number;
  duration: number;
}

interface MovieCardProps {
  movie: CardMedia;
  className?: string;
  progress?: WatchProgress;
  rank?: number;
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

export default function MovieCard({ movie, className, progress, rank }: MovieCardProps) {
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return readFavorites().some((item) => item.id === movie.id);
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const year = movie.releaseDate.split('-')[0];
  const linkSlug = movie.slug || movie.id;
  const cardClassName = className || 'w-[160px] sm:w-[200px] md:w-[240px] shrink-0';

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
    <div 
      className={`relative group ${cardClassName}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Link href={`/movie/${linkSlug}`} className="block">
        <div className={`relative aspect-[2/3] overflow-hidden rounded-md bg-[#1a1a1a] transition-all duration-300 ${isExpanded ? 'scale-105 shadow-[0_0_30px_rgba(229,9,20,0.5)]' : 'group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(229,9,20,0.4)]'} rounded-b-none`}>
          <Image
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 240px"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {rank && rank <= 10 && (
            <div className="absolute left-0 top-2">
              <div className="flex items-end">
                <span className="text-5xl font-bold text-black stroke-white stroke-2 leading-none drop-shadow-lg" style={{ textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff' }}>
                  {rank}
                </span>
              </div>
            </div>
          )}

          <div className="absolute left-2 right-2 top-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={toggleFavorite}
              className="rounded-full bg-black/70 p-1.5 text-white transition-colors hover:bg-[#e50914]"
            >
              <svg
                className={`h-4 w-4 ${isFavorite ? 'text-white' : 'text-gray-300'}`}
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
            <span className="rounded bg-[#e50914] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {movie.quality || 'HD'}
            </span>
          </div>

          {progress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <div 
                className="h-full bg-[#e50914]" 
                style={{ width: `${(progress.progress / progress.duration) * 100}%` }}
              />
            </div>
          )}

          {isExpanded && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-3 px-3">
              <div className="flex gap-2 mb-2">
                <Link
                  href={`/watch/${linkSlug}?source=${movie.sources[0]?.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1 bg-[#e50914] hover:bg-[#b20710] text-white text-xs font-semibold py-1.5 rounded-sm transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
                </Link>
                <button
                  onClick={toggleFavorite}
                  className="p-1.5 rounded-sm border border-gray-500 text-gray-300 hover:border-white hover:text-white transition-colors"
                >
                  <svg className="w-3 h-3" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 2).map((genre) => (
                  <span key={genre} className="text-[10px] text-gray-400">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className={`mt-2 px-1 transition-all duration-300 ${isExpanded ? 'opacity-0 absolute' : 'opacity-100'}`}>
        <h3 className="truncate text-sm font-medium text-white group-hover:text-[#e50914] transition-colors">{movie.title}</h3>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
          <span>{year}</span>
          <span className="text-yellow-500">★ {movie.rating.toFixed(1)}</span>
          {movie.mediaType === 'series' && movie.totalSeasons && (
            <span>{movie.totalSeasons} Seasons</span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="absolute left-0 right-0 -mt-1 bg-[#141414] rounded-b-md overflow-hidden z-10 shadow-xl border border-t-0 border-white/10">
          <div className="px-2 py-2">
            <h3 className="truncate text-sm font-medium text-white">{movie.title}</h3>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
              <span>{year}</span>
              <span className="text-yellow-500">★ {movie.rating.toFixed(1)}</span>
              {movie.runtime && <span>{movie.runtime}</span>}
            </div>
            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{movie.overview}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface MovieCardSkeletonProps {
  className?: string;
}

export function MovieCardSkeleton({ className }: MovieCardSkeletonProps) {
  const cardClassName = className || 'w-[160px] sm:w-[200px] md:w-[240px] shrink-0';

  return (
    <div className={`animate-pulse ${cardClassName}`}>
      <div className="aspect-[2/3] rounded-md bg-[#2a2a2a]" />
    </div>
  );
}

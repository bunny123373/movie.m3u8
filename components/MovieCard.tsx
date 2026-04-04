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
  const cardClassName = className || 'w-[160px] sm:w-[200px] md:w-[240px] lg:w-[220px] shrink-0';

  const matchPercent = Math.round(movie.rating * 10);
  const isHighMatch = matchPercent >= 70;

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
      <Link href={`/movie/${linkSlug}`} className="block z-10 relative">
        <div className={`relative aspect-[2/3] overflow-hidden rounded-md bg-[#1a1a1a] transition-all duration-300 ${isExpanded ? 'scale-105 shadow-[0_0_30px_rgba(229,9,20,0.5)]' : 'group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(229,9,20,0.4)]'} group-hover:z-20 rounded-b-none`}>
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 220px"
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
        </div>
      </Link>

      <div className={`mt-2 px-1 transition-all duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
        <h3 className="truncate text-sm font-medium text-white group-hover:text-[#e50914] transition-colors">{movie.title}</h3>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
          <span>{year}</span>
          <span className="text-yellow-500">★ {movie.rating.toFixed(1)}</span>
          {movie.mediaType === 'series' && movie.totalSeasons && (
            <span>{movie.totalSeasons} Seasons</span>
          )}
        </div>
      </div>

      <div className={`hidden lg:block absolute left-0 z-30 transition-all duration-300 ${isExpanded ? 'opacity-100 visible' : 'opacity-0 invisible'}`} style={{ top: 'calc(100% - 8px)', left: '4px' }}>
        <div className="bg-zinc-900 rounded-xl shadow-2xl w-[320px] overflow-hidden border border-white/10">
          <div className="relative aspect-[16/9]">
            <Image
              src={movie.backdrop || movie.poster}
              alt={movie.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 flex gap-2">
              <Link
                href={`/watch/${linkSlug}?source=${movie.sources[0]?.id}`}
                className="bg-white text-black w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ▶
              </Link>
              <button
                onClick={toggleFavorite}
                className={`bg-white/20 w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors ${isFavorite ? 'text-[#e50914]' : 'text-white'}`}
              >
                +
              </button>
              <button className="bg-white/20 w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                👍
              </button>
              <button className="bg-white/20 w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                👎
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-3 text-xs text-gray-300 mb-3">
              {isHighMatch && (
                <span className="text-green-500 font-semibold">{matchPercent}% Match</span>
              )}
              <span>{year}</span>
              <span className="border border-gray-600 px-1 rounded text-gray-400">U/A 16+</span>
              <span className="text-gray-500">HD</span>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs text-gray-400 mb-2">
              {movie.genres.slice(0, 4).map((genre) => (
                <span key={genre} className="hover:text-gray-300 cursor-pointer">
                  {genre}
                  <span className="mx-1">•</span>
                </span>
              ))}
            </div>

            {movie.runtime && (
              <div className="text-xs text-gray-500">
                <span className="mr-2">▶ Episodes available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MovieCardSkeletonProps {
  className?: string;
}

export function MovieCardSkeleton({ className }: MovieCardSkeletonProps) {
  const cardClassName = className || 'w-[160px] sm:w-[200px] md:w-[240px] lg:w-[220px] shrink-0';

  return (
    <div className={`animate-pulse ${cardClassName}`}>
      <div className="aspect-[2/3] rounded-md bg-[#2a2a2a]" />
    </div>
  );
}
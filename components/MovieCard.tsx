'use client';

import { useState, useEffect } from 'react';
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
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const year = movie.releaseDate.split('-')[0];
  const activeSources = movie.sources.filter(s => s.active).length;
  const linkSlug = movie.slug || movie.id;

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      const favs = JSON.parse(stored);
      setIsFavorite(favs.some((f: any) => f.id === movie.id));
    }
  }, [movie.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = localStorage.getItem('favorites');
    const favs = stored ? JSON.parse(stored) : [];
    
    if (isFavorite) {
      const updated = favs.filter((f: any) => f.id !== movie.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      const updated = [...favs, {
        id: movie.id,
        slug: movie.slug,
        title: movie.title,
        poster: movie.poster,
        mediaType: movie.mediaType || 'movie'
      }];
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(true);
    }
  };

  return (
    <Link href={`/movie/${linkSlug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-800">
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
        >
          <svg 
            className={`w-4 h-4 ${isFavorite ? 'text-red-500' : 'text-white'}`} 
            fill={isFavorite ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-white truncate">{movie.title}</h3>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
          <span>{year}</span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {movie.rating}
          </span>
          {movie.mediaType === 'series' && movie.totalSeasons && (
            <span className="text-purple-400">S{movie.totalSeasons}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-2xl bg-zinc-800" />
      <div className="mt-3 space-y-2">
        <div className="h-5 w-3/4 bg-zinc-800 rounded" />
        <div className="h-4 w-1/2 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

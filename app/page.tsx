'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MovieCard from '@/components/MovieCard';

interface Movie {
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
  runtime: string;
  fileSize: string;
  sources: { id: string; name: string; url: string; type: 'mp4' | 'm3u8' | 'embed'; priority: number; active: boolean }[];
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch('/api/movies');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFeatured(data[0]);
            setMovies(data);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch movies:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
                <div className="mt-3 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !featured) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          Unable to load movies. Make sure MongoDB is running.
        </p>
      </div>
    );
  }

  const year = featured.releaseDate.split('-')[0];

  return (
    <main>
      <section className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0">
          <Image
            src={featured.backdrop}
            alt={featured.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-yellow-500/90 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {featured.rating}
              </span>
              <span className="px-3 py-1 text-sm font-medium text-white bg-white/20 rounded-full backdrop-blur-sm">
                {year}
              </span>
              <span className="px-3 py-1 text-sm font-medium text-white bg-white/20 rounded-full backdrop-blur-sm">
                {featured.quality}
              </span>
              <span className="px-3 py-1 text-sm font-medium text-white bg-white/20 rounded-full backdrop-blur-sm">
                {featured.runtime}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{featured.title}</h1>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-zinc-300 mb-2">Available Audio</p>
              <div className="flex flex-wrap gap-2">
                {featured.audioLanguages.map((lang) => (
                  <span key={lang} className="px-3 py-1 text-xs font-medium text-white bg-white/10 rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-900/30 rounded">
                Subtitles Available
              </span>
            </div>

            <p className="text-zinc-300 mb-6 line-clamp-2">{featured.overview}</p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/movie/${featured.id}`}
                className="px-6 py-3 text-sm font-medium text-zinc-900 bg-white rounded-full hover:bg-zinc-100 transition-colors"
              >
                Watch Now
              </Link>
              <Link
                href={`/movie/${featured.id}`}
                className="px-6 py-3 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">Recent Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </main>
  );
}

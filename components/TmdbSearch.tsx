'use client';

import { useState, useEffect, useCallback } from 'react';

interface TmdbResult {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

interface TmdbSearchProps {
  onSelect: (movie: TmdbResult) => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export default function TmdbSearch({ onSelect }: TmdbSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchMovies = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
      if (!apiKey || apiKey === 'your_tmdb_api_key_here') {
        setResults([]);
        return;
      }

      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setResults(data.results?.slice(0, 5) || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('TMDB search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) searchMovies(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, searchMovies]);

  const handleSelect = (movie: TmdbResult) => {
    const genres = movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean);
    onSelect({
      ...movie,
      genre_ids: genres as unknown as number[],
    });
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movie from TMDB..."
          className="w-full px-4 py-3 pl-10 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {results.map((movie) => (
            <button
              key={movie.id}
              onClick={() => handleSelect(movie)}
              className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
            >
              {movie.poster_path ? (
                <img
                  src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
                  alt={movie.title}
                  className="w-10 h-14 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-600 rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-white truncate">{movie.title}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {movie.release_date?.split('-')[0] || 'N/A'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';

interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
}

interface TmdbSearchProps {
  onSelect: (movie: any) => void;
  type?: 'movie' | 'tv' | 'all';
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
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export default function TmdbSearch({ onSelect, type = 'all' }: TmdbSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');

  const searchTmdb = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/tmdb?q=${encodeURIComponent(searchQuery)}&type=${type}`);
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `API error: ${res.status}`);
      }
      
      const data = await res.json();
      setResults(data.results || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('TMDB search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query.length >= 2) {
        searchTmdb(query);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, searchTmdb]);

  const handleSelect = (result: TmdbResult) => {
    const genres = result.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean);
    const title = result.title || result.name || '';
    const releaseDate = result.release_date || result.first_air_date || '';
    const mediaType = result.media_type || (type === 'tv' ? 'tv' : 'movie');
    
    onSelect({
      id: result.id,
      title,
      poster_path: result.poster_path,
      backdrop_path: result.backdrop_path,
      release_date: releaseDate,
      first_air_date: releaseDate,
      vote_average: result.vote_average,
      overview: result.overview,
      genres,
      media_type: mediaType as 'movie' | 'tv',
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
          placeholder={type === 'tv' ? 'Search TV series...' : type === 'movie' ? 'Search movies...' : 'Search from TMDB...'}
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

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
            >
              {result.poster_path ? (
                <img
                  src={`${TMDB_IMAGE_BASE}${result.poster_path}`}
                  alt={result.title || result.name}
                  className="w-10 h-14 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-600 rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-white truncate">{result.title || result.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0] || 'N/A'}
                  {result.media_type === 'tv' && ' • TV Series'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && query.length >= 2 && results.length === 0 && !loading && !error && (
        <p className="mt-2 text-sm text-zinc-500">No results found</p>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'series';
}

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  const recent = getRecentSearches();
  const updated = [query, ...recent.filter(r => r !== query)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMedia = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/series'),
        ]);
        const movies = await moviesRes.json();
        const series = await seriesRes.json();
        
        let allMedia = [
          ...movies.map((m: any) => ({ ...m, mediaType: 'movie' as const })),
          ...series.map((s: any) => ({ ...s, mediaType: 'series' as const })),
        ];
        
        if (filter !== 'all') {
          allMedia = allMedia.filter((item: SearchResult) => item.mediaType === filter);
        }
        
        const filtered = allMedia.filter((item: SearchResult) =>
          item.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
        
        setResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMedia, 300);
    return () => clearTimeout(debounce);
  }, [query, filter]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);
    if (searchQuery.length >= 2) {
      saveRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search movies, series..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full sm:w-64 px-4 py-2 pl-10 text-sm bg-zinc-800 border border-zinc-700 rounded-full focus:outline-none focus:border-red-500 text-white placeholder-zinc-500"
        />
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            <div>
              <div className="p-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-zinc-500 px-2">Quick filters</span>
                </div>
                <div className="flex gap-2 px-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filter === 'all' ? 'bg-[#00a8e1] text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('movie')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filter === 'movie' ? 'bg-[#00a8e1] text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Movies
                  </button>
                  <button
                    onClick={() => setFilter('series')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filter === 'series' ? 'bg-[#00a8e1] text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Series
                  </button>
                </div>
              </div>
              
              {recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs text-zinc-500">Recent searches</span>
                    <button onClick={() => { clearRecentSearches(); setRecentSearches([]); }} className="text-xs text-zinc-500 hover:text-white">
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(search)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="p-4 text-center text-zinc-500">Searching...</div>
          ) : results.length > 0 ? (
            <div>
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/movie/${item.slug || item.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                    saveRecentSearch(query);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-10 h-14 rounded overflow-hidden bg-zinc-800 shrink-0">
                    {item.poster && (
                      <Image src={item.poster} alt={item.title} width={40} height={56} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.title}</p>
                    <p className="text-zinc-500 text-xs">{item.mediaType === 'movie' ? 'Movie' : 'Series'}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-zinc-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}

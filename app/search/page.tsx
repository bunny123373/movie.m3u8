'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface Source {
  id: string;
  name: string;
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
}

interface MediaItem {
  id: string;
  slug?: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  releaseDate: string;
  overview: string;
  genres: string[];
  mediaType: 'movie' | 'series';
  totalSeasons?: number;
  totalEpisodes?: number;
  sources: Source[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/series'),
        ]);

        const movies = moviesRes.ok ? await moviesRes.json() : [];
        const series = seriesRes.ok ? await seriesRes.json() : [];

        const allMedia: MediaItem[] = [
          ...movies.map((m: any) => ({ ...m, mediaType: 'movie' as const })),
          ...series.map((s: any) => ({ ...s, mediaType: 'series' as const })),
        ];

        setMedia(allMedia);
      } catch (err) {
        console.error('Failed to fetch:', err);
      }
    }

    fetchMedia();
  }, []);

  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = media.filter((item) => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.genres.some((g) => g.toLowerCase().includes(lowerQuery)) ||
      item.overview.toLowerCase().includes(lowerQuery)
    );

    setResults(filtered);
    setLoading(false);
  }, [media]);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const popularSearches = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi'];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Search</h1>
        </div>

        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, series, genres..."
            className="w-full px-5 py-4 pl-14 bg-[#1a1a1a] border border-[#333] rounded-xl text-white placeholder-gray-500 focus:border-[#00a8e1] focus:outline-none text-lg"
          />
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        {!loading && hasSearched && results.length > 0 && (
          <div>
            <p className="text-gray-400 mb-4">{results.length} results found</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((item) => (
                <Link key={item.id} href={`/movie/${item.slug || item.id}`} className="group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2 relative">
                    {item.poster ? (
                      <Image src={item.poster} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-medium">
                      ★ {item.rating.toFixed(1)}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium truncate">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{item.releaseDate.split('-')[0]}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No results found for "{query}"</p>
            <p className="text-gray-500 text-sm">Try different keywords or browse genres</p>
          </div>
        )}

        {!hasSearched && (
          <div>
            <p className="text-gray-400 mb-4">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-full text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20 md:pb-0 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
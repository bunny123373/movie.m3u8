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
    <main className="min-h-screen bg-[#141414] text-white pt-16 md:pt-20">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Search</h1>
        </div>

        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titles, people, genres"
            className="w-full px-5 py-3 md:py-4 pl-12 md:pl-14 bg-[#222] border border-transparent rounded text-white placeholder-gray-400 focus:border-white focus:outline-none text-base md:text-lg"
            autoFocus
          />
          <svg className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <span className="text-sm md:text-base font-medium">{results.length} titles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {results.map((item) => (
                <Link key={item.id} href={`/movie/${item.slug || item.id}`} className="group">
                  <div className="aspect-[2/3] rounded overflow-hidden bg-[#222] mb-2 relative transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-red-900/20">
                    {item.poster ? (
                      <Image src={item.backdrop} alt={item.title} fill className="object-cover" />
                    ) : item.poster ? (
                      <Image src={item.poster} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-xs md:text-sm font-medium truncate text-white">{item.title}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.releaseDate.split('-')[0]} • {item.mediaType === 'series' ? `${item.totalEpisodes} eps` : 'Movie'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-12 md:py-20">
            <p className="text-gray-300 text-lg md:text-xl mb-2">No titles found for "{query}"</p>
            <p className="text-gray-500 text-sm md:text-base">Please make sure your spelling is correct, or try using fewer filters.</p>
          </div>
        )}

        {!hasSearched && (
          <div className="max-w-3xl">
            <p className="text-gray-400 text-sm md:text-base mb-3 md:mb-4">Popular searches</p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 md:py-2.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded text-sm md:text-base text-gray-300 hover:text-white transition-colors"
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
    <main className="min-h-screen bg-[#141414] text-white pt-16 md:pt-20 flex items-center justify-center">
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
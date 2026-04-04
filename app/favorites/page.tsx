'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MovieCard from '@/components/MovieCard';

interface FavoriteItem {
  id: string;
  slug?: string;
  title: string;
  poster: string;
  backdrop?: string;
  mediaType: 'movie' | 'series';
  rating?: number;
  releaseDate?: string;
  overview?: string;
  genres?: string[];
  quality?: string;
  sources?: Array<{ id: string; name: string; url: string; type: string }>;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((item) => item.id !== id);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavorites(updated);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#141414] text-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">My List</h1>
          <span className="text-gray-400 text-sm">({favorites.length} titles)</span>
        </div>

        {favorites.length > 0 ? (
          <div className="relative">
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-[#e50914] p-2 rounded-full hidden md:flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 -mx-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {favorites.map((item, index) => (
                <div key={item.id} className="relative group">
                  <MovieCard
                    movie={{
                      id: item.id,
                      slug: item.slug,
                      title: item.title,
                      poster: item.poster,
                      backdrop: item.poster,
                      rating: item.rating || 0,
                      releaseDate: item.releaseDate || '2024-01-01',
                      overview: item.overview || '',
                      genres: item.genres || [],
                      audioLanguages: [],
                      subtitleLanguages: [],
                      quality: item.quality || 'HD',
                      mediaType: item.mediaType,
                      sources: (item.sources as Array<{ id: string; name: string; url: string; type: 'mp4' | 'm3u8' | 'embed'; priority: number; active: boolean }>) || [],
                    }}
                    className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0"
                    rank={index + 1}
                  />
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-[#e50914] p-1.5 rounded-full transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-[#e50914] p-2 rounded-full hidden md:flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-400 text-lg mb-2">Your list is empty</p>
            <p className="text-gray-500 text-sm mb-6">Save movies and series to your list to watch later</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-[#e50914] hover:bg-[#b20710] text-white font-semibold rounded-sm transition-colors"
            >
              Browse Content
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

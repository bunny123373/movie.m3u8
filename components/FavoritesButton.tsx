'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FavoriteItem {
  id: string;
  slug: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'series';
}

export default function FavoritesButton() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill={favorites.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="hidden sm:inline">My List</span>
        {favorites.length > 0 && (
          <span className="bg-[#e50914] text-white text-xs rounded-full px-1.5 py-0.5">{favorites.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#1a1a1a] border border-white/10 rounded-md overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-medium">My List</h3>
            <Link href="/favorites" onClick={() => setIsOpen(false)} className="text-xs text-gray-400 hover:text-[#e50914]">
              View All
            </Link>
          </div>
          {favorites.length > 0 ? (
            <div className="divide-y divide-white/5">
              {favorites.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors">
                  <Link
                    href={`/movie/${item.slug || item.id}`}
                    onClick={() => setIsOpen(false)}
                    className="w-12 h-16 rounded overflow-hidden bg-[#2a2a2a] shrink-0"
                  >
                    {item.poster && (
                      <Image src={item.poster} alt={item.title} width={48} height={64} className="w-full h-full object-cover" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/movie/${item.slug || item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="text-white font-medium text-sm truncate block hover:text-[#e50914]"
                    >
                      {item.title}
                    </Link>
                    <p className="text-gray-500 text-xs">{item.mediaType === 'movie' ? 'Movie' : 'Series'}</p>
                  </div>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="p-1.5 text-gray-500 hover:text-[#e50914] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-sm">Your list is empty</p>
              <p className="text-xs mt-1">Save movies to watch later</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

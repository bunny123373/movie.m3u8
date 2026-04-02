'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminSidebar } from '@/components/AdminSidebar';

interface FavoriteItem {
  id: string;
  slug?: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'series';
  addedAt: string;
}

interface WatchProgress {
  progress: number;
  duration: number;
}

export default function UsersPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({});
  const [media, setMedia] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchlist' | 'history'>('favorites');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites);
        setFavorites(parsed);
      } catch {
        setFavorites([]);
      }
    }

    const storedProgress = localStorage.getItem('watchProgress');
    if (storedProgress) {
      try {
        setWatchProgress(JSON.parse(storedProgress));
      } catch {
        setWatchProgress({});
      }
    }

    async function fetchMedia() {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/series'),
        ]);
        
        const movies = moviesRes.ok ? await moviesRes.json() : [];
        const series = seriesRes.ok ? await seriesRes.json() : [];
        
        setMedia([...movies, ...series]);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMedia();
  }, []);

  const clearFavorites = () => {
    if (confirm('Clear all favorites?')) {
      localStorage.removeItem('favorites');
      setFavorites([]);
    }
  };

  const clearWatchHistory = () => {
    if (confirm('Clear watch history?')) {
      localStorage.removeItem('watchProgress');
      setWatchProgress({});
    }
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavorites(updated);
  };

  const recentWatch = Object.entries(watchProgress)
    .filter(([_, p]) => p.progress > 0)
    .sort((a, b) => b[1].progress - a[1].progress)
    .slice(0, 20);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13]">
        <div className="flex">
          <aside className="w-64 bg-[#18181b] border-r border-zinc-800 h-screen fixed left-0 top-0 p-4">
            <div className="h-8 bg-zinc-800 rounded animate-pulse mb-8" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-zinc-800/50 rounded animate-pulse mb-2" />
            ))}
          </aside>
          <main className="ml-64 flex-1 p-8">
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-[#18181b] rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-[#18181b] rounded-2xl animate-pulse" />
          </main>
        </div>
      </div>
    );
  }

  const getProgressPercent = (progress: number, duration: number) => {
    if (!duration) return 0;
    return Math.round((progress / duration) * 100);
  };

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <AdminSidebar activeHref="/admin/users" />
      
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Users & Analytics</h1>
              <p className="text-zinc-500 mt-1 text-sm">Favorites, watchlist and user activity</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Total Favorites</p>
              <p className="text-2xl font-bold text-white mt-1">{favorites.length}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Watched Items</p>
              <p className="text-2xl font-bold text-white mt-1">{Object.keys(watchProgress).length}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Movies</p>
              <p className="text-2xl font-bold text-white mt-1">{favorites.filter(f => f.mediaType === 'movie').length}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Series</p>
              <p className="text-2xl font-bold text-white mt-1">{favorites.filter(f => f.mediaType === 'series').length}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              Watch History ({Object.keys(watchProgress).length})
            </button>
          </div>

          {activeTab === 'favorites' && (
            <>
              {favorites.length > 0 && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={clearFavorites}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favorites.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800">
                        {item.poster ? (
                          <Image src={item.poster} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">No Image</div>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                        <p className="text-xs text-zinc-500">{item.mediaType === 'movie' ? 'Movie' : 'Series'}</p>
                      </div>
                      <button
                        onClick={() => removeFavorite(item.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <Link
                        href={`/movie/${item.slug || item.id}`}
                        className="absolute inset-0"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  No favorites yet
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {recentWatch.length > 0 && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={clearWatchHistory}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              )}
              {recentWatch.length > 0 ? (
                <div className="space-y-3">
                  {recentWatch.map(([id, progress]) => {
                    const item = media.find(m => m.id === id);
                    if (!item) return null;
                    
                    return (
                      <div key={id} className="flex items-center gap-4 p-4 bg-[#18181b] border border-zinc-800 rounded-xl">
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                          {item.poster && (
                            <Image src={item.poster} alt={item.title} width={48} height={64} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                style={{ width: `${getProgressPercent(progress.progress, progress.duration)}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500">
                              {getProgressPercent(progress.progress, progress.duration)}%
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/watch/${item.slug || id}?source=${item.sources[0]?.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-sm font-medium text-white transition-all shrink-0"
                        >
                          Play
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  No watch history yet
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

  const getMediaDetails = (id: string) => {
    return media.find(m => m.id === id);
  };

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
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#00a8e1] border-t-transparent rounded-full" />
      </div>
    );
  }

  const getProgressPercent = (progress: number, duration: number) => {
    if (!duration) return 0;
    return Math.round((progress / duration) * 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-[#8b949e] hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Users & Analytics</h1>
            <p className="text-[#8b949e] text-sm">Favorites, watchlist and user activity</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
            <p className="text-[#8b949e] text-sm">Total Favorites</p>
            <p className="text-2xl font-bold mt-1">{favorites.length}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
            <p className="text-[#8b949e] text-sm">Watched Items</p>
            <p className="text-2xl font-bold mt-1">{Object.keys(watchProgress).length}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
            <p className="text-[#8b949e] text-sm">Movies</p>
            <p className="text-2xl font-bold mt-1">{favorites.filter(f => f.mediaType === 'movie').length}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
            <p className="text-[#8b949e] text-sm">Series</p>
            <p className="text-2xl font-bold mt-1">{favorites.filter(f => f.mediaType === 'series').length}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#00a8e1] text-white'
                : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
            }`}
          >
            Favorites ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-[#00a8e1] text-white'
                : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
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
                  className="px-4 py-2 text-sm text-[#f85149] hover:bg-[#3d2a2a] rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favorites.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#21262d]">
                      {item.poster ? (
                        <Image src={item.poster} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8b949e]">No Image</div>
                      )}
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium truncate">{item.title}</h3>
                      <p className="text-xs text-[#8b949e]">{item.mediaType === 'movie' ? 'Movie' : 'Series'}</p>
                    </div>
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="text-center py-12 text-[#8b949e]">
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
                  className="px-4 py-2 text-sm text-[#f85149] hover:bg-[#3d2a2a] rounded-lg transition-colors"
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
                    <div key={id} className="flex items-center gap-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
                      <div className="w-12 h-16 rounded overflow-hidden bg-[#21262d] shrink-0">
                        {item.poster && (
                          <Image src={item.poster} alt={item.title} width={48} height={64} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-[#30363d] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#00a8e1] rounded-full"
                              style={{ width: `${getProgressPercent(progress.progress, progress.duration)}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#8b949e]">
                            {getProgressPercent(progress.progress, progress.duration)}%
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/watch/${item.slug || id}?source=${item.sources[0]?.id}`}
                        className="px-4 py-2 bg-[#00a8e1] hover:bg-[#00b4e6] rounded-lg text-sm font-medium transition-colors shrink-0"
                      >
                        Play
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-[#8b949e]">
                No watch history yet
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
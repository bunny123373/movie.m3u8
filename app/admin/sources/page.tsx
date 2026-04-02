'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminSidebar } from '@/components/AdminSidebar';

interface Source {
  id: string;
  name: string;
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
  priority: number;
  active: boolean;
}

interface MediaItem {
  id: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'series';
  sources: Source[];
}

export default function SourcesPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'm3u8' | 'mp4' | 'embed'>('all');

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/series'),
        ]);
        
        const movies = moviesRes.ok ? await moviesRes.json() : [];
        const series = seriesRes.ok ? await seriesRes.json() : [];
        
        const allMedia = [
          ...movies.map((m: any) => ({ ...m, mediaType: 'movie' as const })),
          ...series.map((s: any) => ({ ...s, mediaType: 'series' as const })),
        ];
        
        setMedia(allMedia);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMedia();
  }, []);

  const filteredMedia = media.filter(item => {
    const matchesType = filter === 'all' || item.mediaType === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const hasMatchingSource = typeFilter === 'all' || item.sources.some(s => s.type === typeFilter);
    return matchesType && matchesSearch && hasMatchingSource;
  });

  const totalSources = media.reduce((acc, item) => acc + item.sources.length, 0);
  const activeSources = media.reduce((acc, item) => acc + item.sources.filter(s => s.active).length, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'm3u8': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'mp4': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'embed': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      default: return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
    }
  };

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
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-[#18181b] rounded-2xl animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <AdminSidebar activeHref="/admin/sources" />
      
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Sources Manager</h1>
              <p className="text-zinc-500 mt-1 text-sm">Manage streaming sources across all content</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Total Content</p>
              <p className="text-2xl font-bold text-white mt-1">{media.length}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Total Sources</p>
              <p className="text-2xl font-bold text-white mt-1">{totalSources}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Active Sources</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{activeSources}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Inactive</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{totalSources - activeSources}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Search content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="series">Series</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Sources</option>
              <option value="m3u8">M3U8</option>
              <option value="mp4">MP4</option>
              <option value="embed">Embed</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredMedia.map((item) => (
              <div key={item.id} className="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-24 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    {item.poster && (
                      <Image src={item.poster} alt={item.title} width={64} height={96} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white truncate">{item.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-lg font-medium ${
                        item.mediaType === 'movie' 
                          ? 'bg-cyan-500/20 text-cyan-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {item.mediaType === 'movie' ? 'Movie' : 'Series'}
                      </span>
                      <Link
                        href={`/admin/edit/${item.id}?type=${item.mediaType}`}
                        className="ml-auto px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                    {item.sources.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {item.sources.map((source) => (
                          <div
                            key={source.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                              source.active 
                                ? 'border-zinc-700 bg-zinc-800/50' 
                                : 'border-red-900/30 bg-red-900/10'
                            }`}
                          >
                            <span className={`px-2 py-0.5 text-xs rounded-lg border ${getTypeColor(source.type)}`}>
                              {source.type.toUpperCase()}
                            </span>
                            <span className="text-sm text-zinc-400">{source.name}</span>
                            <span className={`w-2 h-2 rounded-full ${source.active ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-sm">No sources configured</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredMedia.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                No content found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

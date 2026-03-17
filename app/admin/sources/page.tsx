'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
      case 'm3u8': return 'bg-sky-500/20 text-sky-300';
      case 'mp4': return 'bg-emerald-500/20 text-emerald-300';
      case 'embed': return 'bg-violet-500/20 text-violet-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#00a8e1] border-t-transparent rounded-full" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">Sources Manager</h1>
            <p className="text-[#8b949e] text-sm">Manage streaming sources across all content</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
            <p className="text-[#8b949e] text-sm">Total Content</p>
            <p className="text-2xl font-bold mt-1">{media.length}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
            <p className="text-[#8b949e] text-sm">Total Sources</p>
            <p className="text-2xl font-bold mt-1">{totalSources}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
            <p className="text-[#8b949e] text-sm">Active Sources</p>
            <p className="text-2xl font-bold mt-1 text-green-400">{activeSources}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
            <p className="text-[#8b949e] text-sm">Inactive</p>
            <p className="text-2xl font-bold mt-1 text-red-400">{totalSources - activeSources}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] focus:outline-none focus:border-[#00a8e1]"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="series">Series</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
          >
            <option value="all">All Sources</option>
            <option value="m3u8">M3U8</option>
            <option value="mp4">MP4</option>
            <option value="embed">Embed</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredMedia.map((item) => (
            <div key={item.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-[#21262d] shrink-0">
                  {item.poster && (
                    <Image src={item.poster} alt={item.title} width={64} height={96} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      item.mediaType === 'movie' 
                        ? 'bg-[#1f3b5c] text-[#58a6ff]' 
                        : 'bg-[#3d2e5c] text-[#a371f7]'
                    }`}>
                      {item.mediaType === 'movie' ? 'Movie' : 'Series'}
                    </span>
                    <Link
                      href={`/admin/edit/${item.id}?type=${item.mediaType}`}
                      className="ml-auto px-3 py-1 text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition-colors"
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
                              ? 'border-[#30363d] bg-[#0d1117]' 
                              : 'border-red-900/30 bg-red-900/10'
                          }`}
                        >
                          <span className={`px-2 py-0.5 text-xs rounded ${getTypeColor(source.type)}`}>
                            {source.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-[#8b949e]">{source.name}</span>
                          <span className={`w-2 h-2 rounded-full ${source.active ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#8b949e] text-sm">No sources configured</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredMedia.length === 0 && (
            <div className="text-center py-12 text-[#8b949e]">
              No content found
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
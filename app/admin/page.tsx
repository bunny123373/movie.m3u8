'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSlug } from '@/lib/types';

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
  slug?: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  releaseDate: string;
  overview: string;
  genres: string[];
  audioLanguages: string[];
  subtitleLanguages: string[];
  quality: string;
  sources: Source[];
  mediaType: 'movie' | 'series';
  totalSeasons?: number;
  totalEpisodes?: number;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/admin/sources', label: 'Sources', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { href: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/admin/homepage', label: 'Homepage', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/admin/logs', label: 'Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/admin/import', label: 'Import', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
];

export default function AdminDashboard() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'series'>('movies');
  const [showSuccess, setShowSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchMedia();
    
    const successParam = new URLSearchParams(window.location.search).get('success');
    if (successParam === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, []);

  async function fetchMedia() {
    try {
      const [moviesRes, seriesRes] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/series'),
      ]);
      
      const moviesData = moviesRes.ok ? await moviesRes.json() : [];
      const seriesData = seriesRes.ok ? await seriesRes.json() : [];
      
      const allMedia = [
        ...moviesData.map((m: any) => ({ ...m, mediaType: 'movie' as const })),
        ...seriesData.map((s: any) => ({ ...s, mediaType: 'series' as const })),
      ];
      
      setMedia(allMedia);
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string, type: 'movie' | 'series') {
    if (!confirm('Delete this item?')) return;
    
    try {
      const endpoint = type === 'movie' ? '/api/movies' : '/api/series';
      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMedia(media.filter(m => m.id !== id));
        setSelectedItems(selectedItems.filter(mid => mid !== id));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  async function bulkDelete() {
    if (selectedItems.length === 0) return;
    if (!confirm(`Delete ${selectedItems.length} items?`)) return;
    
    const moviesToDelete = selectedItems.filter(id => media.find(m => m.id === id && m.mediaType === 'movie'));
    const seriesToDelete = selectedItems.filter(id => media.find(m => m.id === id && m.mediaType === 'series'));
    
    for (const id of moviesToDelete) {
      await fetch(`/api/movies?id=${id}`, { method: 'DELETE' });
    }
    for (const id of seriesToDelete) {
      await fetch(`/api/series?id=${id}`, { method: 'DELETE' });
    }
    
    setMedia(media.filter(m => !selectedItems.includes(m.id)));
    setSelectedItems([]);
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    
    setSaving(true);
    try {
      const endpoint = editingItem.mediaType === 'movie' ? '/api/movies' : '/api/series';
      const res = await fetch(`${endpoint}?id=${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      
      if (res.ok) {
        setMedia(media.map(m => m.id === editingItem.id ? editingItem : m));
        setEditingItem(null);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }

  const filteredMedia = media
    .filter(m => 
      m.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterType === 'all' || m.mediaType === filterType)
    )
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  const movies = filteredMedia.filter(m => m.mediaType === 'movie');
  const series = filteredMedia.filter(m => m.mediaType === 'series');

  const stats = {
    totalMovies: media.filter(m => m.mediaType === 'movie').length,
    totalSeries: media.filter(m => m.mediaType === 'series').length,
    avgRating: media.length ? (media.reduce((acc, m) => acc + m.rating, 0) / media.length).toFixed(1) : '0.0',
    totalSources: media.reduce((acc, m) => acc + m.sources.length, 0),
  };

  function toggleSelectAll() {
    const currentList = activeTab === 'movies' ? movies : series;
    if (selectedItems.length === currentList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentList.map(m => m.id));
    }
  }

  const currentList = activeTab === 'movies' ? movies : series;

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
            <div className="h-96 bg-[#18181b] rounded-2xl animate-pulse" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#18181b] border border-zinc-800 rounded-lg lg:hidden"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`fixed top-0 left-0 h-full bg-[#18181b] border-r border-zinc-800 w-64 p-4 z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.99 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">StreamGrid</span>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.href === '/admin'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Back to Site
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg animate-pulse">
            Added successfully!
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Content Manager</h1>
              <p className="text-zinc-500 mt-1 text-sm">Manage your movie and series library</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/add-movie" className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/20">
                + Add Movie
              </Link>
              <Link href="/add-series" className="px-4 py-2.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all">
                + Add Series
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.99 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
                  </svg>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-lg">Movies</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalMovies}</p>
              <p className="text-sm text-zinc-500 mt-1">Total movies</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 8h2v8H9zm4 0h2v8h-2z"/>
                  </svg>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-lg">Series</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalSeries}</p>
              <p className="text-sm text-zinc-500 mt-1">Total series</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-lg">Rating</span>
              </div>
              <p className="text-3xl font-bold text-white">★ {stats.avgRating}</p>
              <p className="text-sm text-zinc-500 mt-1">Average rating</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-lg">Sources</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalSources}</p>
              <p className="text-sm text-zinc-500 mt-1">Total sources</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveTab('movies'); setSelectedItems([]); }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    activeTab === 'movies'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  Movies ({movies.length})
                </button>
                <button
                  onClick={() => { setActiveTab('series'); setSelectedItems([]); }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    activeTab === 'series'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  Series ({series.length})
                </button>
              </div>
              <input
                type="text"
                placeholder="Search titles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            {selectedItems.length > 0 && (
              <div className="px-4 sm:px-6 py-4 bg-zinc-800/30 border-b border-zinc-800 flex items-center gap-4">
                <span className="text-zinc-400">{selectedItems.length} selected</span>
                <button
                  onClick={bulkDelete}
                  className="px-3 py-1.5 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === currentList.length && currentList.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Content</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Type</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">Quality</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">Sources</th>
                    <th className="px-4 sm:px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {currentList.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => {
                            if (selectedItems.includes(item.id)) {
                              setSelectedItems(selectedItems.filter(id => id !== item.id));
                            } else {
                              setSelectedItems([...selectedItems, item.id]);
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                        />
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                            {item.poster && (
                              <Image src={item.poster} alt={item.title} width={48} height={64} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate max-w-[150px] sm:max-w-none">{item.title}</p>
                            <p className="text-sm text-zinc-500">{item.releaseDate.split('-')[0]} • ★ {item.rating}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                          item.mediaType === 'movie' 
                            ? 'bg-cyan-500/20 text-cyan-400' 
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {item.mediaType === 'movie' ? 'Movie' : 'Series'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <span className="px-3 py-1.5 text-xs bg-zinc-800 text-zinc-400 rounded-lg">{item.quality}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-zinc-400 hidden sm:table-cell">{item.sources.length}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/edit/${item.id}?type=${item.mediaType}`}
                            className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/movie/${item.slug || item.id}`}
                            className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => deleteItem(item.id, item.mediaType)}
                            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentList.length === 0 && (
              <div className="p-12 text-center text-zinc-500">
                No {activeTab} found
              </div>
            )}
          </div>
        </div>
      </main>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={saveItem}>
              <div className="p-4 sm:p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">Edit {editingItem.mediaType === 'movie' ? 'Movie' : 'Series'}</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={editingItem.title}
onChange={(e) => setEditingItem({ 
                      ...editingItem!, 
                      title: e.target.value,
                      slug: createSlug(e.target.value, editingItem!.id)
                    })}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Slug</label>
                  <input
                    type="text"
                    value={editingItem.slug || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Quality</label>
                    <select
                      value={editingItem.quality}
                      onChange={(e) => setEditingItem({ ...editingItem, quality: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="480p">480p</option>
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                  {editingItem.mediaType === 'series' && (
                    <>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Seasons</label>
                        <input
                          type="number"
                          min="1"
                          value={editingItem.totalSeasons || 1}
                          onChange={(e) => setEditingItem({ ...editingItem, totalSeasons: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Episodes</label>
                        <input
                          type="number"
                          min="0"
                          value={editingItem.totalEpisodes || 0}
                          onChange={(e) => setEditingItem({ ...editingItem, totalEpisodes: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t border-zinc-800 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-medium disabled:opacity-50 transition-all"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

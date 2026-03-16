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
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117] p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-[#161b22] border border-[#30363d] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117] text-white">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-[#00a8e1] text-white rounded-lg shadow-lg animate-pulse">
          Added successfully!
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Content Manager</h1>
            <p className="text-[#8b949e] mt-1">Manage your library</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/add-movie"
              className="px-5 py-2.5 text-sm font-medium bg-[#00a8e1] hover:bg-[#00b4e6] rounded-lg transition-all shadow-lg shadow-[#00a8e1]/20"
            >
              + Add Movie
            </Link>
            <Link
              href="/add-series"
              className="px-5 py-2.5 text-sm font-medium bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all"
            >
              + Add Series
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00a8e1]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.99 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
              <p className="text-[#8b949e] text-sm">Total Movies</p>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.totalMovies}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#a371f7]" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 8h2v8H9zm4 0h2v8h-2z"/></svg>
              <p className="text-[#8b949e] text-sm">Total Series</p>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.totalSeries}</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#f0b429]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <p className="text-[#8b949e] text-sm">Avg Rating</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-[#f0b429]">★ {stats.avgRating}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('movies'); setSelectedItems([]); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'movies'
                ? 'bg-[#00a8e1] text-white shadow-lg shadow-[#00a8e1]/20'
                : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => { setActiveTab('series'); setSelectedItems([]); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'series'
                ? 'bg-[#00a8e1] text-white shadow-lg shadow-[#00a8e1]/20'
                : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
            }`}
          >
            Series ({series.length})
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white placeholder-[#8b949e] focus:outline-none focus:border-[#00a8e1] focus:ring-1 focus:ring-[#00a8e1]"
          />
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
            <span className="text-[#8b949e]">{selectedItems.length} selected</span>
            <button
              onClick={bulkDelete}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-3 py-1.5 text-sm text-[#8b949e] hover:text-white"
            >
              Clear
            </button>
          </div>
        )}

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#21262d]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentList.length && currentList.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-[#00a8e1]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8b949e] uppercase">Content</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8b949e] uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8b949e] uppercase">Quality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8b949e] uppercase">Sources</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#8b949e] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {currentList.map((item) => (
                <tr key={item.id} className="hover:bg-[#21262d]/50 transition-colors">
                  <td className="px-4 py-3">
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
                      className="w-4 h-4 rounded accent-[#00a8e1]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded overflow-hidden bg-[#21262d] shrink-0">
                        {item.poster && (
                          <Image src={item.poster} alt={item.title} width={48} height={64} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-[#8b949e]">{item.releaseDate.split('-')[0]} • ★ {item.rating}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      item.mediaType === 'movie' 
                        ? 'bg-[#1f3b5c] text-[#58a6ff]' 
                        : 'bg-[#3d2e5c] text-[#a371f7]'
                    }`}>
                      {item.mediaType === 'movie' ? 'Movie' : 'Series'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-[#21262d] text-[#8b949e] rounded">{item.quality}</span>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e]">{item.sources.length}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition-colors"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/movie/${item.slug || item.id}`}
                        className="px-3 py-1.5 text-xs bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteItem(item.id, item.mediaType)}
                        className="px-3 py-1.5 text-xs bg-[#3d2a2a] text-[#f85149] hover:bg-[#5d3a3a] rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentList.length === 0 && (
            <div className="p-12 text-center text-[#8b949e]">
              No {activeTab} found
            </div>
          )}
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl">
            <form onSubmit={saveItem}>
              <div className="p-6 border-b border-[#30363d]">
                <h2 className="text-xl font-bold">Edit {editingItem.mediaType === 'movie' ? 'Movie' : 'Series'}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-[#8b949e] mb-1">Title</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      title: e.target.value,
                      slug: createSlug(e.target.value, editingItem.id)
                    })}
                    className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8b949e] mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingItem.slug || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#8b949e] mb-1">Quality</label>
                    <select
                      value={editingItem.quality}
                      onChange={(e) => setEditingItem({ ...editingItem, quality: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
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
                        <label className="block text-sm text-[#8b949e] mb-1">Seasons</label>
                        <input
                          type="number"
                          min="1"
                          value={editingItem.totalSeasons || 1}
                          onChange={(e) => setEditingItem({ ...editingItem, totalSeasons: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#8b949e] mb-1">Episodes</label>
                        <input
                          type="number"
                          min="0"
                          value={editingItem.totalEpisodes || 0}
                          onChange={(e) => setEditingItem({ ...editingItem, totalEpisodes: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-[#30363d] flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#00a8e1] hover:bg-[#00b4e6] rounded-lg font-medium disabled:opacity-50 transition-all shadow-lg shadow-[#00a8e1]/20"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

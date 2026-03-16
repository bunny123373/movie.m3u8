'use client';

import { useEffect, useState } from 'react';
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
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg animate-pulse">
          Added successfully!
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-zinc-400 mt-1">Manage your content</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/add-movie"
              className="px-5 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              + Add Movie
            </Link>
            <Link
              href="/add-series"
              className="px-5 py-2.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              + Add Series
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 p-5 rounded-xl">
            <p className="text-zinc-400 text-sm">Total Movies</p>
            <p className="text-3xl font-bold mt-1">{stats.totalMovies}</p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-xl">
            <p className="text-zinc-400 text-sm">Total Series</p>
            <p className="text-3xl font-bold mt-1">{stats.totalSeries}</p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-xl">
            <p className="text-zinc-400 text-sm">Avg Rating</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">★ {stats.avgRating}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('movies'); setSelectedItems([]); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'movies'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => { setActiveTab('series'); setSelectedItems([]); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'series'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Series ({series.length})
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-zinc-900 rounded-lg">
            <span className="text-zinc-400">{selectedItems.length} selected</span>
            <button
              onClick={bulkDelete}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors"
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

        <div className="bg-zinc-900 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentList.length && currentList.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Content</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Quality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Sources</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {currentList.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30">
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
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded overflow-hidden bg-zinc-800 shrink-0">
                        {item.poster && (
                          <Image src={item.poster} alt={item.title} width={48} height={64} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-zinc-500">{item.releaseDate.split('-')[0]} • ★ {item.rating}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      item.mediaType === 'movie' 
                        ? 'bg-blue-900/50 text-blue-400' 
                        : 'bg-purple-900/50 text-purple-400'
                    }`}>
                      {item.mediaType === 'movie' ? 'Movie' : 'Series'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-zinc-700 rounded">{item.quality}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{item.sources.length}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/movie/${item.id}`}
                        className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteItem(item.id, item.mediaType)}
                        className="px-3 py-1.5 text-xs bg-red-900/50 text-red-400 hover:bg-red-900 rounded transition-colors"
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
            <div className="p-12 text-center text-zinc-500">
              No {activeTab} found
            </div>
          )}
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-lg">
            <form onSubmit={saveItem}>
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold">Edit {editingItem.mediaType === 'movie' ? 'Movie' : 'Series'}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Quality</label>
                    <select
                      value={editingItem.quality}
                      onChange={(e) => setEditingItem({ ...editingItem, quality: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
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
                        <label className="block text-sm text-zinc-400 mb-1">Seasons</label>
                        <input
                          type="number"
                          min="1"
                          value={editingItem.totalSeasons || 1}
                          onChange={(e) => setEditingItem({ ...editingItem, totalSeasons: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Episodes</label>
                        <input
                          type="number"
                          min="0"
                          value={editingItem.totalEpisodes || 0}
                          onChange={(e) => setEditingItem({ ...editingItem, totalEpisodes: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-zinc-800 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
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

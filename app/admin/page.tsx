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
  season?: number;
  episode?: number;
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
  runtime?: string;
  fileSize?: string;
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
  const [filterQuality, setFilterQuality] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'releaseDate'>('releaseDate');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'series'>('movies');

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    try {
      const [moviesRes, seriesRes] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/series'),
      ]);
      
      const movies = moviesRes.ok ? await moviesRes.json() : [];
      const series = seriesRes.ok ? await seriesRes.json() : [];
      
      const allMedia: MediaItem[] = [
        ...movies.map((m: MediaItem) => ({ ...m, mediaType: 'movie' as const })),
        ...series.map((s: MediaItem) => ({ ...s, mediaType: 'series' as const })),
      ];
      
      setMedia(allMedia);
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string, type: 'movie' | 'series') {
    if (!confirm('Are you sure you want to delete this?')) return;
    
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
      (filterType === 'all' || m.mediaType === filterType) &&
      (filterQuality === '' || m.quality === filterQuality)
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });

  const movies = filteredMedia.filter(m => m.mediaType === 'movie');
  const series = filteredMedia.filter(m => m.mediaType === 'series');

  const stats = {
    totalMovies: media.filter(m => m.mediaType === 'movie').length,
    totalSeries: media.filter(m => m.mediaType === 'series').length,
    avgRating: media.length ? (media.reduce((acc, m) => acc + m.rating, 0) / media.length).toFixed(1) : 0,
  };

  const qualities = [...new Set(media.map(m => m.quality))];

  function toggleSelectAll() {
    const currentList = activeTab === 'movies' ? movies : series;
    if (selectedItems.length === currentList.length) {
      setSelectedItems(selectedItems.filter(id => !currentList.find(m => m.id === id)));
    } else {
      setSelectedItems([...new Set([...selectedItems, ...currentList.map(m => m.id)])]);
    }
  }

  function toggleSelect(id: string) {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(mid => mid !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  const currentList = activeTab === 'movies' ? movies : series;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/add-movie"
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            + Movie
          </Link>
          <Link
            href="/add-series"
            className="px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            + Series
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Movies</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalMovies}</p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Series</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalSeries}</p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg Rating</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">⭐ {stats.avgRating}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === 'movies'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Movies ({movies.length})
        </button>
        <button
          onClick={() => setActiveTab('series')}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === 'series'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Series ({series.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 text-zinc-900 dark:text-white"
        />
        <select
          value={filterQuality}
          onChange={(e) => setFilterQuality(e.target.value)}
          className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 text-zinc-900 dark:text-white"
        >
          <option value="">All Quality</option>
          {qualities.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 text-zinc-900 dark:text-white"
        >
          <option value="releaseDate">Newest</option>
          <option value="rating">Rating</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {selectedItems.length} selected
          </span>
          <button
            onClick={bulkDelete}
            className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedItems([])}
            className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentList.length && currentList.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Title</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Quality</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {currentList.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                        {item.poster && (
                          <Image
                            src={item.poster}
                            alt={item.title}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{item.title}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {item.releaseDate.split('-')[0]} • ⭐ {item.rating}
                          {item.mediaType === 'series' && ` • S${item.totalSeasons}E${item.totalEpisodes}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded">
                      {item.quality}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      item.mediaType === 'movie'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {item.mediaType === 'movie' ? 'Movie' : 'Series'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id, item.mediaType)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
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
          <div className="p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No {activeTab} found</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={saveItem}>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit {editingItem.mediaType === 'movie' ? 'Movie' : 'Series'}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Quality</label>
                    <select
                      value={editingItem.quality}
                      onChange={(e) => setEditingItem({ ...editingItem, quality: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
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
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Seasons</label>
                        <input
                          type="number"
                          min="1"
                          value={editingItem.totalSeasons || 1}
                          onChange={(e) => setEditingItem({ ...editingItem, totalSeasons: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Episodes</label>
                        <input
                          type="number"
                          min="0"
                          value={editingItem.totalEpisodes || 0}
                          onChange={(e) => setEditingItem({ ...editingItem, totalEpisodes: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Overview</label>
                  <textarea
                    value={editingItem.overview}
                    onChange={(e) => setEditingItem({ ...editingItem, overview: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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

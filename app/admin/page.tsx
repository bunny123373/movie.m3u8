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

interface Movie {
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
  runtime: string;
  fileSize: string;
  sources: Source[];
}

export default function AdminDashboard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'releaseDate'>('releaseDate');
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  async function fetchMovies() {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMovie(id: string) {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    
    try {
      const res = await fetch(`/api/movies?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMovies(movies.filter(m => m.id !== id));
        setSelectedMovies(selectedMovies.filter(mid => mid !== id));
      }
    } catch (err) {
      console.error('Failed to delete movie:', err);
    }
  }

  async function bulkDelete() {
    if (selectedMovies.length === 0) return;
    if (!confirm(`Delete ${selectedMovies.length} movies?`)) return;
    
    for (const id of selectedMovies) {
      await fetch(`/api/movies?id=${id}`, { method: 'DELETE' });
    }
    setMovies(movies.filter(m => !selectedMovies.includes(m.id)));
    setSelectedMovies([]);
  }

  async function saveMovie(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMovie) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/movies?id=${editingMovie.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMovie),
      });
      
      if (res.ok) {
        setMovies(movies.map(m => m.id === editingMovie.id ? editingMovie : m));
        setEditingMovie(null);
      }
    } catch (err) {
      console.error('Failed to save movie:', err);
    } finally {
      setSaving(false);
    }
  }

  function toggleSelectAll() {
    if (selectedMovies.length === filteredMovies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(filteredMovies.map(m => m.id));
    }
  }

  function toggleSelect(id: string) {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter(mid => mid !== id));
    } else {
      setSelectedMovies([...selectedMovies, id]);
    }
  }

  const filteredMovies = movies
    .filter(m => 
      m.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterQuality === '' || m.quality === filterQuality)
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });

  const stats = {
    total: movies.length,
    totalSources: movies.reduce((acc, m) => acc + m.sources.length, 0),
    avgRating: movies.length ? (movies.reduce((acc, m) => acc + m.rating, 0) / movies.length).toFixed(1) : 0,
    byQuality: movies.reduce((acc, m) => {
      acc[m.quality] = (acc[m.quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const qualities = [...new Set(movies.map(m => m.quality))];

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
        <Link
          href="/add-movie"
          className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          + Add Movie
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Movies</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Sources</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalSources}</p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg Rating</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">⭐ {stats.avgRating}</p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">By Quality</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {Object.entries(stats.byQuality).map(([q, c]) => `${q}:${c}`).join(' | ')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search movies..."
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
      {selectedMovies.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {selectedMovies.length} selected
          </span>
          <button
            onClick={bulkDelete}
            className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedMovies([])}
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
                    checked={selectedMovies.length === filteredMovies.length && filteredMovies.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Movie</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Quality</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sources</th>
                <th className="px-4 py-4 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedMovies.includes(movie.id)}
                      onChange={() => toggleSelect(movie.id)}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                        {movie.poster && (
                          <Image
                            src={movie.poster}
                            alt={movie.title}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{movie.title}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {movie.releaseDate.split('-')[0]} • ⭐ {movie.rating}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded">
                      {movie.quality}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {movie.sources.length} source{movie.sources.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingMovie(movie)}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/movie/${movie.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteMovie(movie.id)}
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

        {filteredMovies.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No movies found</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={saveMovie}>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Movie</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingMovie.title}
                    onChange={(e) => setEditingMovie({ ...editingMovie, title: e.target.value })}
                    className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Quality</label>
                    <select
                      value={editingMovie.quality}
                      onChange={(e) => setEditingMovie({ ...editingMovie, quality: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
                    >
                      <option value="480p">480p</option>
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Runtime</label>
                    <input
                      type="text"
                      value={editingMovie.runtime}
                      onChange={(e) => setEditingMovie({ ...editingMovie, runtime: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
                      placeholder="2h 30m"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">File Size</label>
                  <input
                    type="text"
                    value={editingMovie.fileSize}
                    onChange={(e) => setEditingMovie({ ...editingMovie, fileSize: e.target.value })}
                    className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
                    placeholder="2.4 GB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Overview</label>
                  <textarea
                    value={editingMovie.overview}
                    onChange={(e) => setEditingMovie({ ...editingMovie, overview: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={editingMovie.genres.join(', ')}
                    onChange={(e) => setEditingMovie({ ...editingMovie, genres: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white"
                    placeholder="Action, Drama"
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
                  onClick={() => setEditingMovie(null)}
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: number;
  releaseDate: string;
  quality: string;
  sources: { id: string; name: string; url: string; type: string; priority: number; active: boolean }[];
}

export default function AdminDashboard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/movies?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMovies(movies.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete movie:', err);
    } finally {
      setDeleting(null);
    }
  }

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

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Movie</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Quality</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sources</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {movies.map((movie) => (
              <tr key={movie.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-6 py-4">
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
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded">
                    {movie.quality}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {movie.sources.length} source{movie.sources.length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/movie/${movie.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => deleteMovie(movie.id)}
                      disabled={deleting === movie.id}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                    >
                      {deleting === movie.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {movies.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No movies found</p>
            <Link
              href="/add-movie"
              className="mt-4 inline-block text-sm text-zinc-900 dark:text-white hover:underline"
            >
              Add your first movie
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Source, createSlug } from '@/lib/types';
import TmdbSearch from '@/components/TmdbSearch';
import MoviePreview from '@/components/MoviePreview';
import SourceInput from '@/components/SourceInput';

interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: (string | number)[];
  media_type?: 'movie' | 'tv';
}

interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: (string | number)[];
  media_type?: 'movie' | 'tv';
}

export default function AddMoviePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [poster, setPoster] = useState('');
  const [backdrop, setBackdrop] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [rating, setRating] = useState(0);
  const [overview, setOverview] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [audioLanguages, setAudioLanguages] = useState<string[]>([]);
  const [subtitleLanguages, setSubtitleLanguages] = useState<string[]>([]);
  const [quality, setQuality] = useState('1080p');
  const [runtime, setRuntime] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [sources, setSources] = useState<Source[]>([]);

  const handleTmdbSelect = (movie: TmdbMovie) => {
    setTitle(movie.title || movie.name || '');
    setPoster(movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
    setBackdrop(movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '');
    setReleaseDate(movie.release_date || movie.first_air_date || '');
    setRating(movie.vote_average);
    setOverview(movie.overview);
    setGenres(Array.isArray(movie.genre_ids) ? movie.genre_ids.map(String) : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const movieId = Date.now().toString();
      const movieData = {
        id: movieId,
        slug: createSlug(title, movieId),
        title,
        poster,
        backdrop,
        releaseDate,
        rating,
        overview,
        genres,
        audioLanguages,
        subtitleLanguages,
        quality,
        runtime,
        fileSize,
        sources,
      };

      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        alert('Failed to save movie');
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Error saving movie');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Add New Movie</h1>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Search Movie
          </label>
          <TmdbSearch onSelect={handleTmdbSelect} />
        </div>

        {(title || poster) && (
          <MoviePreview
            title={title}
            poster={poster}
            overview={overview}
            rating={rating}
            releaseDate={releaseDate}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Release Date
            </label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Poster URL
            </label>
            <input
              type="url"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Backdrop URL
            </label>
            <input
              type="url"
              value={backdrop}
              onChange={(e) => setBackdrop(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Rating
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Runtime (e.g., 2h 18m)
            </label>
            <input
              type="text"
              value={runtime}
              onChange={(e) => setRuntime(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Quality
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            >
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4K">4K</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              File Size (e.g., 2.4 GB)
            </label>
            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Overview
          </label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Audio Languages (comma separated)
            </label>
            <input
              type="text"
              value={audioLanguages.join(', ')}
              onChange={(e) => setAudioLanguages(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Telugu, Hindi, English"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Subtitle Languages (comma separated)
            </label>
            <input
              type="text"
              value={subtitleLanguages.join(', ')}
              onChange={(e) => setSubtitleLanguages(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="English, Telugu"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
        </div>

        <SourceInput sources={sources} onChange={setSources} />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Movie'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

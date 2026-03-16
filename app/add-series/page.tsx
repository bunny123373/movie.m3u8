'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Source, createSlug } from '@/lib/types';
import TmdbSearch from '@/components/TmdbSearch';
import MoviePreview from '@/components/MoviePreview';
import SourceInput from '@/components/SourceInput';

interface TmdbResult {
  id: number;
  name?: string;
  title?: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date?: string;
  release_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: (string | number)[];
  media_type?: 'movie' | 'tv';
}

export default function AddSeriesPage() {
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
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [sources, setSources] = useState<Source[]>([]);

  const handleTmdbSelect = (result: TmdbResult) => {
    setTitle(result.name || result.title || '');
    setPoster(result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : '');
    setBackdrop(result.backdrop_path ? `https://image.tmdb.org/t/p/original${result.backdrop_path}` : '');
    setReleaseDate(result.first_air_date || result.release_date || '');
    setRating(result.vote_average);
    setOverview(result.overview);
    setGenres(Array.isArray(result.genre_ids) ? result.genre_ids.map(String) : []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const seriesId = Date.now().toString();
      const seriesData = {
        id: seriesId,
        slug: createSlug(title, seriesId),
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
        totalSeasons,
        totalEpisodes,
        sources,
        mediaType: 'series' as const,
      };

      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seriesData),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        alert('Failed to save series');
      }
    } catch (error) {
      console.error('Error saving series:', error);
      alert('Error saving series');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Add New Series</h1>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Search Series
          </label>
          <TmdbSearch onSelect={handleTmdbSelect} type="tv" />
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
            <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">First Air Date</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Poster URL</label>
            <input
              type="url"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Backdrop URL</label>
            <input
              type="url"
              value={backdrop}
              onChange={(e) => setBackdrop(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Rating</label>
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
            <label className="block text-sm font-medium text-zinc-300 mb-2">Total Seasons</label>
            <input
              type="number"
              min="1"
              value={totalSeasons}
              onChange={(e) => setTotalSeasons(parseInt(e.target.value) || 1)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Total Episodes</label>
            <input
              type="number"
              min="0"
              value={totalEpisodes}
              onChange={(e) => setTotalEpisodes(parseInt(e.target.value) || 0)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Quality</label>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Overview</label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Audio Languages</label>
            <input
              type="text"
              value={audioLanguages.join(', ')}
              onChange={(e) => setAudioLanguages(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Telugu, Hindi, English"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Subtitle Languages</label>
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
            {saving ? 'Saving...' : 'Save Series'}
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

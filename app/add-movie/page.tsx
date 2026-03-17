'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Source, Subtitle, createSlug } from '@/lib/types';
import TmdbSearch from '@/components/TmdbSearch';
import GenreSelector from '@/components/GenreSelector';

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
}

export default function AddMoviePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'sources'>('details');
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
  const [sources, setSources] = useState<Source[]>([
    { id: '1', name: 'Server 1', url: '', type: 'm3u8', priority: 1, active: true, subtitles: [] }
  ]);
  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);
  const [editingSubtitles, setEditingSubtitles] = useState<Subtitle[]>([]);

  const handleTmdbSelect = async (movie: TmdbMovie) => {
    setTitle(movie.title || movie.name || '');
    setPoster(movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
    setBackdrop(movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '');
    setReleaseDate(movie.release_date || movie.first_air_date || '');
    setRating(movie.vote_average);
    setOverview(movie.overview);
    
    if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
      try {
        const res = await fetch('/api/tmdb/genres?type=movie');
        const data = await res.json();
        const genreNames = movie.genre_ids.map((id: string | number) => {
          const genre = data.genres?.find((g: any) => g.id === Number(id));
          return genre ? genre.name : String(id);
        }).filter(Boolean);
        setGenres(genreNames);
      } catch {
        setGenres(movie.genre_ids.map(String));
      }
    }
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
        fileSize: '',
        sources: sources.filter(s => s.url.trim()),
      };

      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData),
      });

      if (res.ok) {
        router.push('/admin?success=true');
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

  const addSource = () => {
    setSources([...sources, { 
      id: Date.now().toString(), 
      name: `Server ${sources.length + 1}`, 
      url: '', 
      type: 'm3u8', 
      priority: sources.length + 1, 
      active: true,
      subtitles: []
    }]);
  };

  const updateSource = (index: number, field: keyof Source, value: any) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const openSubtitleEditor = (index: number) => {
    setEditingSourceIndex(index);
    setEditingSubtitles(sources[index].subtitles || []);
  };

  const addSubtitle = () => {
    setEditingSubtitles([...editingSubtitles, {
      id: Date.now().toString(),
      label: '',
      lang: '',
      url: ''
    }]);
  };

  const updateSubtitle = (index: number, field: keyof Subtitle, value: string) => {
    const updated = [...editingSubtitles];
    updated[index] = { ...updated[index], [field]: value };
    setEditingSubtitles(updated);
  };

  const removeSubtitle = (index: number) => {
    setEditingSubtitles(editingSubtitles.filter((_, i) => i !== index));
  };

  const saveSubtitles = () => {
    if (editingSourceIndex !== null) {
      const updated = [...sources];
      updated[editingSourceIndex].subtitles = editingSubtitles;
      setSources(updated);
    }
    setEditingSourceIndex(null);
    setEditingSubtitles([]);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Add Movie</h1>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-[#161616] rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'details' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'sources' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sources
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#161616] rounded-xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Search TMDB</label>
                    <TmdbSearch onSelect={handleTmdbSelect} />
                  </div>
                </div>

                <div className="bg-[#161616] rounded-xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Basic Info</h2>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Release Year</label>
                      <input
                        type="text"
                        value={releaseDate ? releaseDate.split('-')[0] : ''}
                        onChange={(e) => {
                          const year = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setReleaseDate(year ? `${year}-01-01` : '');
                        }}
                        placeholder="2024"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Overview</label>
                    <textarea
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="bg-[#161616] rounded-xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold">Media Info</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Runtime</label>
                      <input
                        type="text"
                        value={runtime}
                        onChange={(e) => setRuntime(e.target.value)}
                        placeholder="2h 30m"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Quality</label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      >
                        <option value="480p">480p</option>
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="4K">4K</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Genres</label>
                    <GenreSelector value={genres} onChange={setGenres} type="movie" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Audio Languages</label>
                      <input
                        type="text"
                        value={audioLanguages.join(', ')}
                        onChange={(e) => setAudioLanguages(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="English, Hindi"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Subtitles</label>
                      <input
                        type="text"
                        value={subtitleLanguages.join(', ')}
                        onChange={(e) => setSubtitleLanguages(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="English"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#161616] rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Poster & Backdrop</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Poster URL</label>
                      <input
                        type="url"
                        value={poster}
                        onChange={(e) => setPoster(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Backdrop URL</label>
                      <input
                        type="url"
                        value={backdrop}
                        onChange={(e) => setBackdrop(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#00a8e1] focus:outline-none"
                      />
                    </div>
                    {poster && (
                      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#0a0a0a]">
                        <Image src={poster} alt="Poster" width={200} height={300} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="bg-[#161616] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Streaming Sources</h2>
                <button
                  type="button"
                  onClick={addSource}
                  className="px-4 py-2 bg-[#00a8e1] hover:bg-[#00b4e6] rounded-lg text-sm font-medium text-black transition-colors"
                >
                  + Add Source
                </button>
              </div>

              <div className="space-y-4">
                {sources.map((source, index) => (
                  <div key={source.id}>
                    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-[#0a0a0a] rounded-lg">
                      <input
                        type="text"
                        value={source.name}
                        onChange={(e) => updateSource(index, 'name', e.target.value)}
                        placeholder="Source name"
                        className="flex-1 px-4 py-2.5 bg-[#161616] border border-[#333] rounded-lg text-white"
                      />
                      <select
                        value={source.type}
                        onChange={(e) => updateSource(index, 'type', e.target.value)}
                        className="px-4 py-2.5 bg-[#161616] border border-[#333] rounded-lg text-white"
                      >
                        <option value="m3u8">M3U8</option>
                        <option value="mp4">MP4</option>
                        <option value="embed">Embed</option>
                      </select>
                      <input
                        type="url"
                        value={source.url}
                        onChange={(e) => updateSource(index, 'url', e.target.value)}
                        placeholder="Stream URL"
                        className="flex-[2] px-4 py-2.5 bg-[#161616] border border-[#333] rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="px-4 py-2.5 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => openSubtitleEditor(index)}
                        className="px-3 py-1.5 bg-[#222] hover:bg-[#333] rounded text-sm text-gray-300 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Subtitles ({source.subtitles?.length || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editingSourceIndex !== null && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-[#161616] rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">
                    Subtitles for {sources[editingSourceIndex]?.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => { setEditingSourceIndex(null); setEditingSubtitles([]); }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  {editingSubtitles.map((sub, idx) => (
                    <div key={sub.id} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={sub.label}
                        onChange={(e) => updateSubtitle(idx, 'label', e.target.value)}
                        placeholder="Label (e.g. English)"
                        className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white text-sm"
                      />
                      <input
                        type="text"
                        value={sub.lang}
                        onChange={(e) => updateSubtitle(idx, 'lang', e.target.value)}
                        placeholder="Lang (e.g. en)"
                        className="w-20 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white text-sm"
                      />
                      <input
                        type="url"
                        value={sub.url}
                        onChange={(e) => updateSubtitle(idx, 'url', e.target.value)}
                        placeholder="Subtitle URL (.vtt)"
                        className="flex-[2] px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubtitle(idx)}
                        className="px-3 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addSubtitle}
                    className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm text-white"
                  >
                    + Add Subtitle
                  </button>
                  <button
                    type="button"
                    onClick={saveSubtitles}
                    className="px-4 py-2 bg-[#00a8e1] hover:bg-[#00b4e6] rounded-lg text-sm font-medium text-black"
                  >
                    Save Subtitles
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-8 py-3 bg-[#00a8e1] hover:bg-[#00b4e6] rounded-lg font-semibold text-black disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Movie'}
            </button>
            <Link
              href="/admin"
              className="px-8 py-3 bg-[#222] hover:bg-[#333] rounded-lg font-semibold transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

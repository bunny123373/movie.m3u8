'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AdminSidebar } from '@/components/AdminSidebar';

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
  runtime?: string;
}

export default function EditMediaPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const type = searchParams.get('type') || 'movie';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<MediaItem | null>(null);

  useEffect(() => {
    async function fetchMedia() {
      if (!id) {
        router.push('/admin');
        return;
      }

      const endpoint = type === 'tv' ? '/api/series' : '/api/movies';
      
      try {
        const res = await fetch(`${endpoint}?id=${id}`);
        if (!res.ok) {
          router.push('/admin');
          return;
        }
        const data = await res.json();
        setFormData({ ...data, mediaType: type === 'tv' ? 'series' : 'movie' });
      } catch (err) {
        console.error('Failed to fetch:', err);
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [id, type, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    try {
      const endpoint = formData.mediaType === 'movie' ? '/api/movies' : '/api/series';
      const res = await fetch(`${endpoint}?id=${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin?success=true');
      } else {
        alert('Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const addSource = () => {
    if (!formData) return;
    const newSource: Source = {
      id: Date.now().toString(),
      name: `Server ${formData.sources.length + 1}`,
      url: '',
      type: 'm3u8',
      priority: formData.sources.length + 1,
      active: true,
    };
    setFormData({ ...formData, sources: [...formData.sources, newSource] });
  };

  const updateSource = (index: number, field: keyof Source, value: any) => {
    if (!formData) return;
    const sources = [...formData.sources];
    sources[index] = { ...sources[index], [field]: value };
    setFormData({ ...formData, sources });
  };

  const removeSource = (index: number) => {
    if (!formData) return;
    const sources = formData.sources.filter((_, i) => i !== index);
    setFormData({ ...formData, sources });
  };

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

  if (!formData) {
    return null;
  }

  const isMovie = formData.mediaType === 'movie';

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <AdminSidebar activeHref="/admin" />
      
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit {isMovie ? 'Movie' : 'Series'}</h1>
              <p className="text-zinc-500 mt-1 text-sm">{formData.title}</p>
            </div>
          </div>

          {formData.poster && (
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-48 rounded-xl overflow-hidden border border-zinc-800">
                <Image src={formData.poster} alt={formData.title} width={128} height={192} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Release Year</label>
                <input
                  type="text"
                  value={formData.releaseDate ? formData.releaseDate.split('-')[0] : ''}
                  onChange={(e) => {
                    const year = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, releaseDate: year ? `${year}-01-01` : '' });
                  }}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Quality</label>
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>
              {isMovie && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Runtime (e.g., 2h 18m)</label>
                  <input
                    type="text"
                    value={formData.runtime || ''}
                    onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
              {!isMovie && (
                <>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Seasons</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalSeasons || 1}
                      onChange={(e) => setFormData({ ...formData, totalSeasons: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Episodes</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalEpisodes || 0}
                      onChange={(e) => setFormData({ ...formData, totalEpisodes: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Poster URL</label>
              <input
                type="url"
                value={formData.poster}
                onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Backdrop URL</label>
              <input
                type="url"
                value={formData.backdrop}
                onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Overview</label>
              <textarea
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Genres (comma separated)</label>
              <input
                type="text"
                value={formData.genres.join(', ')}
                onChange={(e) => setFormData({ ...formData, genres: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="Action, Drama, Thriller"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Audio Languages</label>
                <input
                  type="text"
                  value={formData.audioLanguages.join(', ')}
                  onChange={(e) => setFormData({ ...formData, audioLanguages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Telugu, Hindi, English"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Subtitle Languages</label>
                <input
                  type="text"
                  value={formData.subtitleLanguages.join(', ')}
                  onChange={(e) => setFormData({ ...formData, subtitleLanguages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="English, Telugu"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Streaming Sources</h3>
                <button
                  type="button"
                  onClick={addSource}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg transition-colors"
                >
                  + Add Source
                </button>
              </div>

              {formData.sources.length === 0 ? (
                <p className="text-zinc-500 text-sm">No sources added yet</p>
              ) : (
                <div className="space-y-3">
                  {formData.sources.map((source, index) => (
                    <div key={source.id} className="flex flex-col sm:flex-row gap-2 p-4 bg-[#18181b] border border-zinc-800 rounded-xl">
                      <input
                        type="text"
                        value={source.name}
                        onChange={(e) => updateSource(index, 'name', e.target.value)}
                        placeholder="Source name"
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                      <select
                        value={source.type}
                        onChange={(e) => updateSource(index, 'type', e.target.value)}
                        className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
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
                        className="flex-[2] px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-medium disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-medium transition-all text-center text-white"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

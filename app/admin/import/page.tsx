'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';

interface Genre {
  id: number;
  name: string;
}

interface TmdbItem {
  id: string;
  tmdbId: number;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  releaseDate: string;
  overview: string;
  genres: number[];
  mediaType: 'movie' | 'tv';
}

export default function ImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [results, setResults] = useState<TmdbItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [browseType, setBrowseType] = useState<'genre' | 'trending' | 'popular' | 'top_rated' | 'now_playing'>('genre');

  const BROWSE_OPTIONS = [
    { id: 'genre', label: 'By Genre' },
    { id: 'trending', label: 'Trending' },
    { id: 'popular', label: 'Popular' },
    { id: 'top_rated', label: 'Top Rated' },
    { id: 'now_playing', label: mediaType === 'movie' ? 'Now Playing' : 'On TV' },
  ];

  useEffect(() => {
    fetchGenres();
  }, [mediaType]);

  async function fetchGenres() {
    try {
      const res = await fetch(`/api/tmdb/genres?type=${mediaType}`);
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  }

  async function searchByGenre() {
    setLoading(true);
    setResults([]);
    setSelectedItems([]);
    setPage(1);
    
    try {
      let endpoint = '';
      if (browseType === 'genre' && selectedGenre) {
        endpoint = `/api/tmdb/discover?genre=${selectedGenre}&type=${mediaType}&page=1`;
      } else {
        endpoint = `/api/tmdb/browse?type=${browseType}&mediaType=${mediaType}&page=1`;
      }
      
      const res = await fetch(endpoint);
      const data = await res.json();
      setResults(data.results || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (page >= totalPages) return;
    setLoading(true);
    
    try {
      let endpoint = '';
      if (browseType === 'genre' && selectedGenre) {
        endpoint = `/api/tmdb/discover?genre=${selectedGenre}&type=${mediaType}&page=${page + 1}`;
      } else {
        endpoint = `/api/tmdb/browse?type=${browseType}&mediaType=${mediaType}&page=${page + 1}`;
      }
      
      const res = await fetch(endpoint);
      const data = await res.json();
      setResults(prev => [...prev, ...(data.results || [])]);
      setPage(prev => prev + 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(id: string) {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  function toggleAll() {
    if (selectedItems.length === results.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(results.map(r => r.id));
    }
  }

  async function importSelected() {
    if (selectedItems.length === 0) return;
    setSaving(true);
    setImportedCount(0);
    
    const itemsToImport = results.filter(r => selectedItems.includes(r.id));
    let count = 0;
    
    for (const item of itemsToImport) {
      try {
        const endpoint = item.mediaType === 'movie' ? '/api/movies' : '/api/series';
        const genreNames = item.genres.map((gid: number) => {
          const g = genres.find(gen => gen.id === gid);
          return g ? g.name : String(gid);
        });
        
        const data = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: item.title,
          slug: `${item.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}-${item.id}`,
          poster: item.poster,
          backdrop: item.backdrop,
          rating: item.rating,
          releaseDate: item.releaseDate,
          overview: item.overview,
          genres: genreNames,
          audioLanguages: [],
          subtitleLanguages: [],
          quality: '1080p',
          ...(item.mediaType === 'movie' 
            ? { runtime: '', fileSize: '' }
            : { totalSeasons: 1, totalEpisodes: 0 }
          ),
          sources: [],
        };

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        count++;
        setImportedCount(count);
      } catch (err) {
        console.error('Failed to import:', err);
      }
    }
    
    setSaving(false);
    setSelectedItems([]);
    
    if (count > 0) {
      router.push('/admin?success=true');
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <AdminSidebar activeHref="/admin/import" />
      
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Import from TMDB</h1>
              <p className="text-zinc-500 mt-1 text-sm">Browse and import content by category</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Content Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setMediaType('movie'); setSelectedGenre(''); setResults([]); setSelectedItems([]); }}
                    className={`px-4 py-2 text-sm rounded-xl transition-all ${
                      mediaType === 'movie'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    Movies
                  </button>
                  <button
                    onClick={() => { setMediaType('tv'); setSelectedGenre(''); setResults([]); setSelectedItems([]); }}
                    className={`px-4 py-2 text-sm rounded-xl transition-all ${
                      mediaType === 'tv'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    TV Shows
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Browse By</label>
                <div className="flex gap-2 flex-wrap">
                  {BROWSE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setBrowseType(opt.id as any); setSelectedGenre(''); setResults([]); setSelectedItems([]); }}
                      className={`px-3 py-2 text-sm rounded-xl transition-all ${
                        browseType === opt.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {browseType === 'genre' && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm text-zinc-400 mb-2">Category</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select a category</option>
                    {genres.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={searchByGenre}
                disabled={(browseType === 'genre' && !selectedGenre) || loading}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Loading...' : 'Browse'}
              </button>
            </div>
          </div>

          {saving && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                <span className="text-zinc-400">Importing... {importedCount}/{selectedItems.length}</span>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleAll}
                    className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all"
                  >
                    {selectedItems.length === results.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-zinc-400">{selectedItems.length} selected</span>
                </div>
                
                {selectedItems.length > 0 && (
                  <button
                    onClick={importSelected}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-medium disabled:opacity-50 transition-all"
                  >
                    {saving ? 'Importing...' : `Import ${selectedItems.length} Items`}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      selectedItems.includes(item.id) 
                        ? 'border-cyan-500 ring-2 ring-cyan-500/50' 
                        : 'border-transparent hover:border-zinc-700'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    {item.poster ? (
                      <Image
                        src={item.poster}
                        alt={item.title}
                        width={200}
                        height={300}
                        className="w-full aspect-[2/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500">No Poster</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {selectedItems.includes(item.id) ? (
                        <svg className="w-12 h-12 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      ) : (
                        <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="text-xs font-medium text-white truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span>★ {item.rating.toFixed(1)}</span>
                        <span>{item.releaseDate?.split('-')[0] || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {page < totalPages && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}

          {results.length === 0 && !loading && selectedGenre && (
            <div className="text-center py-12 text-zinc-500">
              No results found for this category
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
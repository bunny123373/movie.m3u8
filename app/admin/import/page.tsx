'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
    if (!selectedGenre) return;
    setLoading(true);
    setResults([]);
    setSelectedItems([]);
    setPage(1);
    
    try {
      const res = await fetch(`/api/tmdb/discover?genre=${selectedGenre}&type=${mediaType}&page=1`);
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
    if (page >= totalPages || !selectedGenre) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/tmdb/discover?genre=${selectedGenre}&type=${mediaType}&page=${page + 1}`);
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
    <main className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-[#8b949e] hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold">Import from TMDB</h1>
            </div>
            <p className="text-[#8b949e] mt-1">Browse and import content by category</p>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-[#8b949e] mb-2">Content Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setMediaType('movie'); setSelectedGenre(''); setResults([]); setSelectedItems([]); }}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    mediaType === 'movie'
                      ? 'bg-[#00a8e1] text-white'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
                  }`}
                >
                  Movies
                </button>
                <button
                  onClick={() => { setMediaType('tv'); setSelectedGenre(''); setResults([]); setSelectedItems([]); }}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    mediaType === 'tv'
                      ? 'bg-[#00a8e1] text-white'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
                  }`}
                >
                  TV Shows
                </button>
              </div>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-[#8b949e] mb-2">Category</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
              >
                <option value="">Select a category</option>
                {genres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={searchByGenre}
              disabled={!selectedGenre || loading}
              className="px-6 py-2.5 bg-[#00a8e1] hover:bg-[#00b4e6] rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Loading...' : 'Browse'}
            </button>
          </div>
        </div>

        {saving && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-[#00a8e1] border-t-transparent rounded-full" />
              <span className="text-[#8b949e]">Importing... {importedCount}/{selectedItems.length}</span>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleAll}
                  className="px-4 py-2 text-sm bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all"
                >
                  {selectedItems.length === results.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-[#8b949e]">{selectedItems.length} selected</span>
              </div>
              
              {selectedItems.length > 0 && (
                <button
                  onClick={importSelected}
                  disabled={saving}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50 transition-all"
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
                      ? 'border-[#00a8e1] ring-2 ring-[#00a8e1]/50' 
                      : 'border-transparent hover:border-[#30363d]'
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
                    <div className="w-full aspect-[2/3] bg-[#21262d] flex items-center justify-center">
                      <span className="text-[#8b949e]">No Poster</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {selectedItems.includes(item.id) ? (
                      <svg className="w-12 h-12 text-[#00a8e1]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-xs font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
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
                  className="px-6 py-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {results.length === 0 && !loading && selectedGenre && (
          <div className="text-center py-12 text-[#8b949e]">
            No results found for this category
          </div>
        )}
      </div>
    </main>
  );
}
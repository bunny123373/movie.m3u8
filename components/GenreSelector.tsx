'use client';

import { useEffect, useState } from 'react';

interface Genre {
  id: number;
  name: string;
}

interface GenreSelectorProps {
  value: string[];
  onChange: (genres: string[]) => void;
  type: 'movie' | 'tv';
}

const GENRE_ICONS: Record<string, string> = {
  'Action': '💥',
  'Adventure': '🗺️',
  'Animation': '🎨',
  'Comedy': '😂',
  'Crime': '🔍',
  'Documentary': '📽️',
  'Drama': '🎭',
  'Family': '👨‍👩‍👧',
  'Fantasy': '✨',
  'History': '📜',
  'Horror': '👻',
  'Music': '🎵',
  'Mystery': '🔮',
  'Romance': '❤️',
  'Science Fiction': '🚀',
  'Thriller': '😱',
  'War': '⚔️',
  'Western': '🤠',
  'Action & Adventure': '💥',
  'Kids': '👶',
  'News': '📰',
  'Reality': '📺',
  'Sci-Fi & Fantasy': '🔮',
  'Soap': '🧼',
  'Talk': '🎙️',
  'War & Politics': '🏛️',
  'TV Movie': '📺',
};

export default function GenreSelector({ value, onChange, type }: GenreSelectorProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(`/api/tmdb/genres?type=${type}`);
        const data = await res.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGenres();
  }, [type]);

  const toggleGenre = (genreName: string) => {
    if (value.includes(genreName)) {
      onChange(value.filter(g => g !== genreName));
    } else {
      onChange([...value, genreName]);
    }
  };

  const filteredGenres = genres.filter(genre =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayGenres = showAll ? filteredGenres : filteredGenres.slice(0, 12);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-zinc-300">
          Categories
        </label>
        <span className="text-xs text-zinc-500">{value.length} selected</span>
      </div>
      
      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full px-4 py-2 pl-9 bg-[#0a0a0a] border border-[#333] rounded-lg text-white text-sm focus:border-[#00a8e1] focus:outline-none"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
            {displayGenres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.name)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                  value.includes(genre.name)
                    ? 'bg-[#00a8e1] border-[#00a8e1] text-black font-medium'
                    : 'bg-[#0a0a0a] border-[#333] text-zinc-300 hover:border-[#00a8e1]/50'
                }`}
              >
                <span className="text-base">{GENRE_ICONS[genre.name] || '🎬'}</span>
                <span className="truncate">{genre.name}</span>
              </button>
            ))}
          </div>

          {filteredGenres.length > 12 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-3 text-xs text-[#00a8e1] hover:text-[#00b4e6] transition-colors"
            >
              {showAll ? 'Show less' : `Show all ${filteredGenres.length} categories`}
            </button>
          )}
        </>
      )}

      {value.length > 0 && (
        <div className="mt-4 p-3 bg-[#0a0a0a] rounded-lg border border-[#333]">
          <p className="text-xs text-zinc-500 mb-2">Selected Categories:</p>
          <div className="flex flex-wrap gap-2">
            {value.map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#00a8e1]/20 text-[#00a8e1] text-xs rounded-full"
              >
                <span>{GENRE_ICONS[genre] || '🎬'}</span>
                {genre}
                <button
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

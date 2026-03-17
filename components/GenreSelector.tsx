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

export default function GenreSelector({ value, onChange, type }: GenreSelectorProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        Genres (select multiple)
      </label>
      {loading ? (
        <div className="flex gap-2 flex-wrap">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.name)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                value.includes(genre.name)
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}
      {value.length > 0 && (
        <p className="mt-2 text-xs text-zinc-400">
          Selected: {value.join(', ')}
        </p>
      )}
    </div>
  );
}
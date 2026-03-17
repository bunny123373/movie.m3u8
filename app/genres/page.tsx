'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Source {
  id: string;
  name: string;
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
}

interface MediaItem {
  id: string;
  slug?: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  releaseDate: string;
  genres: string[];
  mediaType: 'movie' | 'series';
  totalSeasons?: number;
  totalEpisodes?: number;
  sources: Source[];
}

interface GenreGroup {
  name: string;
  items: MediaItem[];
}

export default function GenresPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genreGroups, setGenreGroups] = useState<GenreGroup[]>([]);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/series'),
        ]);

        const movies = moviesRes.ok ? await moviesRes.json() : [];
        const series = seriesRes.ok ? await seriesRes.json() : [];

        const allMedia: MediaItem[] = [
          ...movies.map((m: any) => ({ ...m, mediaType: 'movie' as const })),
          ...series.map((s: any) => ({ ...s, mediaType: 'series' as const })),
        ];

        setMedia(allMedia);

        const genreMap: Record<string, MediaItem[]> = {};
        allMedia.forEach((item) => {
          item.genres.forEach((genre) => {
            if (!genreMap[genre]) {
              genreMap[genre] = [];
            }
            genreMap[genre].push(item);
          });
        });

        const groups = Object.entries(genreMap)
          .map(([name, items]) => ({
            name,
            items: items.slice(0, 10),
          }))
          .sort((a, b) => b.items.length - a.items.length);

        setGenreGroups(groups);
        if (groups.length > 0) {
          setSelectedGenre(groups[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, []);

  const currentGroup = genreGroups.find((g) => g.name === selectedGenre);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Browse by Genre</h1>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {genreGroups.map((group) => (
            <button
              key={group.name}
              onClick={() => setSelectedGenre(group.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGenre === group.name
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {group.name} ({group.items.length})
            </button>
          ))}
        </div>

        {currentGroup && (
          <section>
            <h2 className="text-xl font-semibold mb-6">{selectedGenre}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentGroup.items.map((item) => (
                <Link key={item.id} href={`/movie/${item.slug || item.id}`} className="group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                    {item.poster ? (
                      <Image
                        src={item.poster}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-sm font-medium truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span>★ {item.rating.toFixed(1)}</span>
                    <span>{item.releaseDate.split('-')[0]}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      item.mediaType === 'movie' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                    }`}>
                      {item.mediaType === 'movie' ? 'Movie' : 'Series'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {genreGroups.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No genres found. Add some content first!
          </div>
        )}
      </div>
    </main>
  );
}
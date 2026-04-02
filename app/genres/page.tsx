'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
];

function GenresContent() {
  const searchParams = useSearchParams();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'movie' | 'series'>('all');

  const urlGenre = searchParams.get('genre');
  const urlType = searchParams.get('type');

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
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, []);

  useEffect(() => {
    if (urlGenre && GENRE_OPTIONS.includes(urlGenre)) {
      setSelectedGenre(urlGenre);
    }
    if (urlType === 'movie' || urlType === 'series') {
      setMediaTypeFilter(urlType);
    }
  }, [urlGenre, urlType]);

  const filteredMedia = media.filter(item => {
    const matchesGenre = !selectedGenre || item.genres.includes(selectedGenre);
    const matchesType = mediaTypeFilter === 'all' || item.mediaType === mediaTypeFilter;
    return matchesGenre && matchesType;
  });

  const genresWithCounts = GENRE_OPTIONS.map(genre => ({
    name: genre,
    count: media.filter(item => item.genres.includes(genre)).length
  })).filter(g => g.count > 0).sort((a, b) => b.count - a.count);

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

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setMediaTypeFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mediaTypeFilter === 'all'
                ? 'bg-[#00a8e1] text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMediaTypeFilter('movie')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mediaTypeFilter === 'movie'
                ? 'bg-[#00a8e1] text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setMediaTypeFilter('series')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mediaTypeFilter === 'series'
                ? 'bg-[#00a8e1] text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            Series
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {genresWithCounts.map((group) => (
            <button
              key={group.name}
              onClick={() => setSelectedGenre(group.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGenre === group.name
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {group.name} ({group.count})
            </button>
          ))}
        </div>

        {selectedGenre && (
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
            <span>Showing:</span>
            <span className="text-white font-medium">{selectedGenre}</span>
            {mediaTypeFilter !== 'all' && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-white capitalize">{mediaTypeFilter === 'movie' ? 'Movies' : 'Series'}</span>
              </>
            )}
          </div>
        )}

        {filteredMedia.length > 0 ? (
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <Link key={item.id} href={`/movie/${item.slug || item.id}`} className="group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2 relative">
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
        ) : (
          <div className="text-center py-20 text-gray-400">
            No {selectedGenre || 'content'} {mediaTypeFilter !== 'all' ? mediaTypeFilter === 'movie' ? 'movies' : 'series' : ''} found.
          </div>
        )}
      </div>
    </main>
  );
}

export default function GenresPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    }>
      <GenresContent />
    </Suspense>
  );
}

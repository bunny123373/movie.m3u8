'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MovieCard from '@/components/MovieCard';

interface Movie {
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
  runtime: string;
  fileSize: string;
  mediaType: 'movie';
  sources: { id: string; name: string; url: string; type: 'mp4' | 'm3u8' | 'embed'; priority: number; active: boolean }[];
}

interface Series {
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
  totalSeasons: number;
  totalEpisodes: number;
  mediaType: 'series';
  sources: { id: string; name: string; url: string; type: 'mp4' | 'm3u8' | 'embed'; priority: number; active: boolean }[];
}

type MediaItem = Movie | Series;

export default function HomePage() {
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [series, setSeries] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/series'),
        ]);
        
        const moviesData = moviesRes.ok ? await moviesRes.json() : [];
        const seriesData = seriesRes.ok ? await seriesRes.json() : [];
        
        const allMedia: MediaItem[] = [
          ...moviesData.map((m: any) => ({ ...m, mediaType: 'movie' as const })),
          ...seriesData.map((s: any) => ({ ...s, mediaType: 'series' as const })),
        ];
        
        if (allMedia.length > 0) {
          setFeatured(allMedia[0]);
          setMovies(moviesData);
          setSeries(seriesData);
        }
        
        const storedProgress = localStorage.getItem('watchProgress');
        if (storedProgress) {
          const progress: any = JSON.parse(storedProgress);
          const continueItems = Object.keys(progress)
            .filter(id => progress[id].progress > 0 && progress[id].progress < progress[id].duration * 0.95)
            .slice(0, 6)
            .map(id => allMedia.find(m => m.id === id))
            .filter(Boolean) as MediaItem[];
          setContinueWatching(continueItems);
        }
      } catch (err) {
        console.warn('Failed to fetch media:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="animate-pulse">
          <div className="h-[85vh] bg-zinc-800" />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-[2/3] bg-zinc-800 rounded-lg" />
                  <div className="mt-2 h-4 bg-zinc-800 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!featured) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">No content available</p>
          <Link href="/admin" className="mt-4 inline-block text-zinc-500 hover:text-white transition-colors">
            Go to Admin
          </Link>
        </div>
      </div>
    );
  }

  const year = featured.releaseDate.split('-')[0];
  const isSeries = featured.mediaType === 'series';

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="relative w-full min-h-[50vh] sm:min-h-[70vh] lg:min-h-[85vh]">
        <div className="absolute inset-0">
          <Image
            src={featured.backdrop}
            alt={featured.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent sm:via-zinc-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-[20vh] sm:pt-[30vh] pb-8 sm:pb-16">
          <div className="max-w-xl sm:max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-green-400 font-medium text-xs sm:text-sm">NETFLIX</span>
              <span className="text-zinc-400 text-xs sm:text-sm">{year}</span>
              <span className="px-2 py-0.5 text-xs border border-zinc-600 rounded">{featured.quality}</span>
              {isSeries && (
                <span className="px-2 py-0.5 text-xs bg-purple-600 rounded">Series</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4">{featured.title}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              {featured.sources[0] && (
                <Link
                  href={`/watch/${featured.slug || featured.id}?source=${featured.sources[0].id}`}
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
                </Link>
              )}
              <Link
                href={`/movie/${featured.slug || featured.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-zinc-500/50 rounded-lg hover:bg-zinc-500/70 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Info
              </Link>
            </div>

            <p className="text-sm sm:text-lg text-zinc-300 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">{featured.overview}</p>

            <div className="flex flex-wrap gap-2">
              {featured.genres.map((genre) => (
                <span key={genre} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-zinc-800/50 rounded-full">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 -mt-20 relative z-20">
        {continueWatching.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <h2 className="text-lg sm:text-2xl font-bold">Continue Watching</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {continueWatching.map((item) => (
                <MovieCard key={item.id} movie={item as any} />
              ))}
            </div>
          </section>
        )}

        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                selectedGenre === 'all' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            {['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Romance', 'Horror', 'Adventure'].map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedGenre === genre ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {selectedGenre !== 'all' && (
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{selectedGenre}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {[...movies, ...series]
                .filter(m => m.genres?.some((g: string) => g.toLowerCase() === selectedGenre.toLowerCase()))
                .map((item) => (
                  <MovieCard key={item.id} movie={item as any} />
                ))}
            </div>
          </section>
        )}

        {selectedGenre === 'all' && movies.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie as any} />
              ))}
            </div>
          </section>
        )}

        {selectedGenre === 'all' && series.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">TV Series</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {series.map((s) => (
                <MovieCard key={s.id} movie={s as any} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

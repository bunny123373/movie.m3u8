'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MovieCard, { MovieCardSkeleton } from '@/components/MovieCard';

interface Source {
  id: string;
  name: string;
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
  priority: number;
  active: boolean;
}

interface BaseMedia {
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
}

interface MovieItem extends BaseMedia {
  mediaType: 'movie';
  runtime: string;
  fileSize: string;
}

interface SeriesItem extends BaseMedia {
  mediaType: 'series';
  totalSeasons: number;
  totalEpisodes: number;
}

type MediaItem = MovieItem | SeriesItem;
type MovieApi = Omit<MovieItem, 'mediaType'>;
type SeriesApi = Omit<SeriesItem, 'mediaType'>;

interface WatchProgress {
  progress: number;
  duration: number;
}

type WatchProgressMap = Record<string, WatchProgress>;

function readWatchProgress(): WatchProgressMap {
  try {
    const rawProgress = localStorage.getItem('watchProgress');
    if (!rawProgress) {
      return {};
    }
    const parsed: unknown = JSON.parse(rawProgress);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed as WatchProgressMap;
  } catch (error) {
    console.error('Failed to read watch progress:', error);
    return {};
  }
}

function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f171e]">
      <div className="animate-pulse">
        <div className="h-[62vh] border-b border-white/10 bg-[#1b2530]" />
        <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <div className="h-7 w-56 rounded bg-[#1b2530]" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }, (_, index) => (
                <MovieCardSkeleton key={index} className="w-[220px] sm:w-[260px] shrink-0" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-7 w-44 rounded bg-[#1b2530]" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }, (_, index) => (
                <MovieCardSkeleton key={`second-${index}`} className="w-[220px] sm:w-[260px] shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [moviesRes, seriesRes] = await Promise.all([fetch('/api/movies'), fetch('/api/series')]);

        const moviesData: MovieApi[] = moviesRes.ok ? ((await moviesRes.json()) as MovieApi[]) : [];
        const seriesData: SeriesApi[] = seriesRes.ok ? ((await seriesRes.json()) as SeriesApi[]) : [];

        const movieItems: MovieItem[] = moviesData.map((movie) => ({ ...movie, mediaType: 'movie' }));
        const seriesItems: SeriesItem[] = seriesData.map((item) => ({ ...item, mediaType: 'series' }));
        const allMedia: MediaItem[] = [...movieItems, ...seriesItems];

        setMovies(movieItems);
        setSeries(seriesItems);
        setFeatured(allMedia[0] || null);

        const progressMap = readWatchProgress();
        const continueItems = Object.keys(progressMap)
          .filter((id) => {
            const record = progressMap[id];
            return record && record.progress > 0 && record.duration > 0 && record.progress < record.duration * 0.95;
          })
          .map((id) => allMedia.find((item) => item.id === id))
          .filter((item): item is MediaItem => Boolean(item))
          .slice(0, 10);

        setContinueWatching(continueItems);
      } catch (error) {
        console.warn('Failed to fetch media:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#movies' || hash === '#series') {
        setSelectedGenre('all');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const allMedia = useMemo<MediaItem[]>(() => [...movies, ...series], [movies, series]);
  const filteredMedia = useMemo(
    () =>
      allMedia.filter((item) =>
        selectedGenre === 'all'
          ? true
          : item.genres.some((genre) => genre.toLowerCase() === selectedGenre.toLowerCase())
      ),
    [allMedia, selectedGenre]
  );

  if (loading) {
    return <HomeSkeleton />;
  }

  if (!featured) {
    return (
      <div className="min-h-screen bg-[#0f171e] flex items-center justify-center">
        <div className="rounded-xl border border-white/10 bg-[#16202a] px-8 py-10 text-center">
          <p className="text-slate-200 text-lg">No content available</p>
          <Link href="/admin" className="mt-4 inline-block text-[#00a8e1] hover:text-[#25baf0] transition-colors">
            Go to Admin
          </Link>
        </div>
      </div>
    );
  }

  const year = featured.releaseDate.split('-')[0];
  const isFeaturedSeries = featured.mediaType === 'series';
  const featuredSubLine = isFeaturedSeries
    ? `${featured.totalSeasons} Seasons | ${featured.totalEpisodes} Episodes`
    : featured.runtime;

  return (
    <main className="min-h-screen bg-[#0f171e] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={featured.backdrop}
            alt={featured.title}
            fill
            priority
            className="object-cover object-top opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/95 to-[#0f171e]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/40 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:pb-16 lg:pt-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[#00a8e1]/45 bg-[#00a8e1]/12 px-3 py-1 text-xs font-semibold text-[#8fdfff]">
              Included with StreamGrid Prime
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">{featured.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-200">
              <span className="rounded-full border border-slate-500/40 px-3 py-1">{year}</span>
              <span className="rounded-full border border-slate-500/40 px-3 py-1">{featured.quality}</span>
              <span className="rounded-full border border-slate-500/40 px-3 py-1">{featuredSubLine}</span>
              <span className="rounded-full border border-slate-500/40 px-3 py-1">Rating {featured.rating}</span>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              {featured.overview}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {featured.sources[0] && (
                <Link
                  href={`/watch/${featured.slug || featured.id}?source=${featured.sources[0].id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#00a8e1] px-6 py-3 text-sm font-semibold text-[#051019] hover:bg-[#25baf0] transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch now
                </Link>
              )}

              <Link
                href={`/movie/${featured.slug || featured.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-slate-400/40 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-300 transition-colors"
              >
                View details
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {featured.genres.slice(0, 5).map((genre) => (
                <span key={genre} className="rounded-full bg-[#1f2b37] px-3 py-1 text-xs font-medium text-slate-200">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2">
            {['all', 'Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Romance', 'Horror', 'Adventure'].map(
              (genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedGenre === genre
                      ? 'bg-[#00a8e1] text-[#051019]'
                      : 'bg-[#1a2430] text-slate-300 hover:text-white'
                  }`}
                >
                  {genre === 'all' ? 'All' : genre}
                </button>
              )
            )}
          </div>
        </div>

        {continueWatching.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Continue Watching</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {continueWatching.map((item) => (
                <MovieCard key={`continue-${item.id}`} movie={item} className="w-[220px] sm:w-[280px] shrink-0" />
              ))}
            </div>
          </section>
        )}

        {selectedGenre !== 'all' && (
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">{selectedGenre}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredMedia.map((item) => (
                <MovieCard key={`genre-${item.id}`} movie={item} className="w-[220px] sm:w-[280px] shrink-0" />
              ))}
            </div>
            {filteredMedia.length === 0 && (
              <p className="rounded-lg border border-white/10 bg-[#16202a] px-4 py-3 text-sm text-slate-300">
                No content found for this genre.
              </p>
            )}
          </section>
        )}

        {selectedGenre === 'all' && movies.length > 0 && (
          <section id="movies" className="scroll-mt-24">
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Movies</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {movies.map((item) => (
                <MovieCard key={`movie-${item.id}`} movie={item} className="w-[220px] sm:w-[280px] shrink-0" />
              ))}
            </div>
          </section>
        )}

        {selectedGenre === 'all' && series.length > 0 && (
          <section id="series" className="scroll-mt-24">
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">TV Series</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {series.map((item) => (
                <MovieCard key={`series-${item.id}`} movie={item} className="w-[220px] sm:w-[280px] shrink-0" />
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

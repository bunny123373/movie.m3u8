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
  ageRating?: string;
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

const GENRE_SECTIONS = [
  { id: 'action', label: 'Action', genres: ['Action', 'Adventure', 'War'] },
  { id: 'comedy', label: 'Comedy', genres: ['Comedy'] },
  { id: 'drama', label: 'Drama', genres: ['Drama', 'Family'] },
  { id: 'thriller', label: 'Thriller', genres: ['Thriller', 'Horror', 'Mystery'] },
  { id: 'scifi', label: 'Sci-Fi & Fantasy', genres: ['Science Fiction', 'Fantasy'] },
  { id: 'romance', label: 'Romance', genres: ['Romance'] },
  { id: 'animation', label: 'Animation', genres: ['Animation'] },
];

const MOVIE_GENRE_SECTIONS = [
  { id: 'action-movies', label: 'Action Movies', genres: ['Action', 'Adventure'], isMovie: true },
  { id: 'comedy-movies', label: 'Comedy Movies', genres: ['Comedy'], isMovie: true },
  { id: 'drama-movies', label: 'Drama Movies', genres: ['Drama'], isMovie: true },
  { id: 'thriller-movies', label: 'Thriller Movies', genres: ['Thriller', 'Horror', 'Mystery'], isMovie: true },
  { id: 'scifi-movies', label: 'Sci-Fi Movies', genres: ['Science Fiction', 'Fantasy'], isMovie: true },
  { id: 'romance-movies', label: 'Romance Movies', genres: ['Romance'], isMovie: true },
  { id: 'animation-movies', label: 'Animated Movies', genres: ['Animation'], isMovie: true },
];

const SERIES_GENRE_SECTIONS = [
  { id: 'action-series', label: 'Action Series', genres: ['Action', 'Adventure'], isMovie: false },
  { id: 'comedy-series', label: 'Comedy Series', genres: ['Comedy'], isMovie: false },
  { id: 'drama-series', label: 'Drama Series', genres: ['Drama'], isMovie: false },
  { id: 'thriller-series', label: 'Thriller Series', genres: ['Thriller', 'Horror', 'Mystery'], isMovie: false },
  { id: 'scifi-series', label: 'Sci-Fi Series', genres: ['Science Fiction', 'Fantasy'], isMovie: false },
  { id: 'romance-series', label: 'Romance Series', genres: ['Romance'], isMovie: false },
  { id: 'animation-series', label: 'Animated Series', genres: ['Animation'], isMovie: false },
];

function readWatchProgress(): WatchProgressMap {
  try {
    const rawProgress = localStorage.getItem('watchProgress');
    if (!rawProgress) return {};
    const parsed: unknown = JSON.parse(rawProgress);
    if (!parsed || typeof parsed !== 'object') return {};
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
  const [trendingTmdb, setTrendingTmdb] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'movies' | 'series'>('all');

  async function fetchMedia() {
    try {
      const [moviesRes, seriesRes, trendingRes] = await Promise.all([
        fetch('/api/movies?' + Date.now()),
        fetch('/api/series?' + Date.now()),
        fetch('/api/tmdb/trending?time_window=week&' + Date.now())
      ]);

      const moviesData: MovieApi[] = moviesRes.ok ? ((await moviesRes.json()) as MovieApi[]) : [];
      const seriesData: SeriesApi[] = seriesRes.ok ? ((await seriesRes.json()) as SeriesApi[]) : [];
      const trendingData = trendingRes.ok ? ((await trendingRes.json()) as { results: any[] }) : { results: [] };

      const movieItems: MovieItem[] = moviesData.map((movie) => ({ ...movie, mediaType: 'movie' as const }));
      const seriesItems: SeriesItem[] = seriesData.map((item) => ({ ...item, mediaType: 'series' as const }));
      const allMedia: MediaItem[] = [...movieItems, ...seriesItems];

      const localMovieMap = new Map(movieItems.map(m => [m.title.toLowerCase().trim(), m]));
      const localSeriesMap = new Map(seriesItems.map(s => [s.title.toLowerCase().trim(), s]));

      const trendingItems: MediaItem[] = (trendingData.results || []).reduce((acc: MediaItem[], item: any) => {
        const titleKey = item.title?.toLowerCase().trim();
        
        if (item.mediaType === 'series') {
          const localMatch = localSeriesMap.get(titleKey);
          if (localMatch) acc.push(localMatch);
        } else {
          const localMatch = localMovieMap.get(titleKey);
          if (localMatch) acc.push(localMatch);
        }
        return acc;
      }, []);

      if (trendingItems.length < 3 && allMedia.length > 0) {
        const topRated = [...allMedia]
          .sort((a, b) => b.rating - a.rating)
          .filter(item => !trendingItems.find(t => t.id === item.id))
          .slice(0, 10 - trendingItems.length);
        trendingItems.push(...topRated);
      }

      setTrendingTmdb(trendingItems);
      setMovies(movieItems);
      setSeries(seriesItems);
      
      const localFeatured = allMedia[0];
      if (localFeatured) {
        setFeatured(localFeatured);
      } else if (trendingItems[0]) {
        setFeatured(trendingItems[0]);
      }

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

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchMedia();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const allMedia = useMemo<MediaItem[]>(() => [...movies, ...series], [movies, series]);
  const progressMap = readWatchProgress();

  const getItemsByGenre = (section: typeof MOVIE_GENRE_SECTIONS[0], items: MediaItem[]) => {
    return items.filter(item => 
      item.genres.some(g => section.genres.includes(g))
    ).slice(0, 10);
  };

  const filteredMedia = useMemo(() => {
    if (activeCategory === 'all') return allMedia;
    if (activeCategory === 'movies') return movies;
    return series;
  }, [activeCategory, allMedia, movies, series]);

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

  return (
    <main className="min-h-screen bg-[#0f171e] text-white pb-safe md:pb-0">

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-[#00a8e1] text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('movies')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'movies'
                ? 'bg-[#00a8e1] text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveCategory('series')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'series'
                ? 'bg-[#00a8e1] text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Series
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-2 sm:px-6 lg:px-8">
        {continueWatching.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Continue Watching</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {continueWatching.map((item) => (
                <MovieCard key={`continue-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
              ))}
            </div>
          </section>
        )}

        {trendingTmdb.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Trending Now</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {trendingTmdb.map((item) => (
                <MovieCard key={`trending-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
              ))}
            </div>
          </section>
        )}

        {(activeCategory === 'all' || activeCategory === 'movies') && MOVIE_GENRE_SECTIONS.map(section => {
          const items = getItemsByGenre({ ...section, isMovie: true }, movies);
          if (items.length === 0) return null;
          
          return (
            <section key={section.id}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold sm:text-2xl">{section.label}</h2>
                <Link
                  href={`/genres?type=movie&genre=${encodeURIComponent(section.genres[0])}`}
                  className="text-sm text-[#00a8e1] hover:text-[#25baf0] transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {items.map((item) => (
                  <MovieCard key={`movie-${section.id}-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
                ))}
              </div>
            </section>
          );
        })}

        {(activeCategory === 'all' || activeCategory === 'series') && SERIES_GENRE_SECTIONS.map(section => {
          const items = getItemsByGenre({ ...section, isMovie: false }, series);
          if (items.length === 0) return null;
          
          return (
            <section key={section.id}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold sm:text-2xl">{section.label}</h2>
                <Link
                  href={`/genres?type=series&genre=${encodeURIComponent(section.genres[0])}`}
                  className="text-sm text-[#00a8e1] hover:text-[#25baf0] transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {items.map((item) => (
                  <MovieCard key={`series-${section.id}-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
                ))}
              </div>
            </section>
          );
        })}

        {allMedia.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-lg">No content available</p>
            <Link href="/admin" className="mt-4 inline-block text-[#00a8e1] hover:text-[#25baf0] transition-colors">
              Add content in Admin
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

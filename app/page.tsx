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
    <div className="min-h-screen bg-[#141414]">
      <div className="animate-pulse">
        <div className="h-[62vh] border-b border-white/10 bg-[#1a1a1a]" />
        <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <div className="h-7 w-56 rounded bg-[#1a1a1a]" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }, (_, index) => (
                <MovieCardSkeleton key={index} className="w-[220px] sm:w-[260px] shrink-0" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-7 w-44 rounded bg-[#1a1a1a]" />
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
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-8 py-10 text-center">
          <p className="text-gray-200 text-lg">No content available</p>
          <Link href="/admin" className="mt-4 inline-block text-[#e50914] hover:text-[#b20710] transition-colors">
            Go to Admin
          </Link>
        </div>
      </div>
    );
  }

  const year = featured.releaseDate.split('-')[0];
  const featuredProgress = progressMap[featured.id];

  const trendingWithNumbers = trendingTmdb.slice(0, 10).map((item, idx) => ({ ...item, rank: idx + 1 }));
  const topRatedMovies = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const topRatedSeries = [...series].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const continueWatchingItems = continueWatching.slice(0, 10);

  const getGenreLabel = (genres: string[]) => {
    if (genres.includes('Action') || genres.includes('Adventure')) return 'Action & Adventure';
    if (genres.includes('Comedy')) return 'Comedies';
    if (genres.includes('Drama')) return 'Dramas';
    if (genres.includes('Thriller') || genres.includes('Horror')) return 'Thrillers';
    if (genres.includes('Science Fiction') || genres.includes('Fantasy')) return 'Sci-Fi & Fantasy';
    if (genres.includes('Romance')) return 'Romances';
    if (genres.includes('Animation')) return 'Anime';
    return genres[0] || 'Trending';
  };

  return (
    <main className="min-h-screen bg-[#141414] text-white pb-safe md:pb-0 pt-16 md:pt-20">
      <section className="relative h-[55vh] md:h-[560px] lg:h-[640px] rounded-2xl md:rounded-3xl overflow-hidden mx-2 md:mx-4 mt-2">
        <div className="absolute inset-0">
          <Image
            src={featured.backdrop || featured.poster || '/placeholder.jpg'}
            alt={featured.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-[#141414] to-transparent" />

        <div className="absolute left-3 md:left-10 bottom-8 md:bottom-16 right-3 md:right-auto">
          <div className="flex flex-wrap gap-2 md:gap-3 text-[10px] md:text-xs text-gray-200 mb-2 md:mb-3">
            {featured.genres.slice(0, 3).map((genre) => (
              <span key={genre}>{genre.toUpperCase()}</span>
            ))}
          </div>

          <h1 className="text-2xl md:text-5xl lg:text-6xl font-semibold leading-none line-clamp-1 md:line-clamp-2">
            {featured.title}
          </h1>

          <p className="mt-2 md:mt-4 text-xs md:text-sm text-gray-200 max-w-sm md:max-xl line-clamp-2 md:line-clamp-3">
            {featured.overview}
          </p>

          <div className="flex gap-2 md:gap-3 mt-3 md:mt-6">
            <Link
              href={`/watch/${featured.slug || featured.id}?source=${featured.sources[0]?.id}`}
              className="flex items-center gap-1.5 md:gap-2 bg-white text-black px-3 md:px-6 py-2 md:py-3 rounded text-xs md:text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="hidden md:inline">{featuredProgress ? 'Resume' : 'Play'}</span>
              <span className="md:hidden">{featuredProgress ? 'Resume' : 'Play'}</span>
            </Link>
            <Link
              href={`/movie/${featured.slug || featured.id}`}
              className="flex items-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm px-3 md:px-6 py-2 md:py-3 rounded text-xs md:text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden md:inline">More Info</span>
              <span className="md:hidden">Info</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-2 md:mt-4 pb-8 -mt-12 relative z-20">
        {continueWatchingItems.length > 0 && (
          <section className="px-2 md:px-4">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>Continue Watching</span>
              <span className="text-gray-500">›</span>
            </h2>
              <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {continueWatchingItems.map((item) => (
                  <div key={item.id} className="shrink-0 w-[110px] sm:w-[130px] md:w-[160px] lg:w-[180px]">
                    <Link href={`/movie/${item.slug || item.id}`}>
                      <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 rounded-md overflow-hidden">
                        <Image
                          src={item.backdrop || item.poster}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                          {progressMap[item.id] && (
                            <div
                              className="h-full bg-[#e50914]"
                              style={{ width: `${(progressMap[item.id].progress / progressMap[item.id].duration) * 100}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-xs mt-1 truncate text-gray-300">{item.title}</p>
                    </Link>
                  </div>
                ))}
              </div>
          </section>
        )}

        {trendingWithNumbers.length > 0 && (
          <section className="px-2 md:px-4">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>Top 10 in India</span>
              <span className="text-gray-500">›</span>
            </h2>
            <div className="flex gap-4 md:gap-6 pb-2 overflow-x-auto scrollbar-hide">
              {trendingWithNumbers.map((item, idx) => (
                <div key={item.id} className="shrink-0 flex items-center">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent leading-none select-none"
                    style={{ WebkitTextStroke: '2px rgba(255,255,255,0.7)' }}>
                    {idx + 1}
                  </span>
                  <Link href={`/movie/${item.slug || item.id}`} className="block">
                    <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 w-[110px] sm:w-[130px] md:w-[160px] lg:w-[180px] rounded-md overflow-hidden">
                      <Image
                        src={item.backdrop || item.poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {topRatedMovies.length > 0 && (
          <section className="px-2 md:px-4">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>Top Rated Movies</span>
              <span className="text-gray-500">›</span>
            </h2>
            <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {topRatedMovies.map((item) => (
                <div key={item.id} className="shrink-0 w-[110px] sm:w-[130px] md:w-[160px] lg:w-[180px]">
                  <Link href={`/movie/${item.slug || item.id}`}>
                    <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 rounded-md overflow-hidden">
                      <Image
                        src={item.backdrop || item.poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-1 right-1">
                        <span className="text-[10px] text-yellow-500">★ {item.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs mt-1 truncate text-gray-300">{item.title}</p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {topRatedSeries.length > 0 && (
          <section className="px-2 md:px-4">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>Top Rated TV Shows</span>
              <span className="text-gray-500">›</span>
            </h2>
            <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {topRatedSeries.map((item) => (
                <div key={item.id} className="shrink-0 w-[110px] sm:w-[130px] md:w-[160px] lg:w-[180px]">
                  <Link href={`/movie/${item.slug || item.id}`}>
                    <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 rounded-md overflow-hidden">
                      <Image
                        src={item.backdrop || item.poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-1 right-1">
                        <span className="text-[10px] text-yellow-500">★ {item.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs mt-1 truncate text-gray-300">{item.title}</p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {MOVIE_GENRE_SECTIONS.map((section) => {
          const items = getItemsByGenre({ ...section, isMovie: true }, movies);
          if (items.length === 0) return null;
          return (
            <section key={section.id} className="px-2 md:px-4">
              <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
                <span>{section.label}</span>
                <span className="text-gray-500">›</span>
              </h2>
              <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {items.map((item) => (
                  <div key={item.id} className="shrink-0 w-[110px] sm:w-[130px] md:w-[160px] lg:w-[180px]">
                    <Link href={`/movie/${item.slug || item.id}`}>
                      <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 rounded-md overflow-hidden">
                        <Image
                          src={item.backdrop || item.poster}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      </div>
                      <p className="text-xs mt-1 truncate text-gray-300">{item.title}</p>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {SERIES_GENRE_SECTIONS.map((section) => {
          const items = getItemsByGenre({ ...section, isMovie: false }, series);
          if (items.length === 0) return null;
          return (
            <section key={section.id} className="px-2 md:px-4">
              <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
                <span>{section.label}</span>
                <span className="text-gray-500">›</span>
              </h2>
              <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {items.map((item) => (
                  <div key={item.id} className="shrink-0 w-[110px] sm:w-[130px] md:w-[160px] lg:w-[180px]">
                    <Link href={`/movie/${item.slug || item.id}`}>
                      <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 rounded-md overflow-hidden">
                        <Image
                          src={item.backdrop || item.poster}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-1 right-1">
                          <span className="text-[10px] bg-[#e50914] px-1.5 py-0.5 rounded text-white">TV</span>
                        </div>
                      </div>
                      <p className="text-xs mt-1 truncate text-gray-300">{item.title}</p>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

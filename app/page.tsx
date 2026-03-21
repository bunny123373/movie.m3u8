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
  const [trendingTmdb, setTrendingTmdb] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const [moviesRes, seriesRes, trendingRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/series'),
          fetch('/api/tmdb/trending?time_window=week')
        ]);

        const moviesData: MovieApi[] = moviesRes.ok ? ((await moviesRes.json()) as MovieApi[]) : [];
        const seriesData: SeriesApi[] = seriesRes.ok ? ((await seriesRes.json()) as SeriesApi[]) : [];
        const trendingData = trendingRes.ok ? ((await trendingRes.json()) as { results: any[] }) : { results: [] };

        const movieItems: MovieItem[] = moviesData.map((movie) => ({ ...movie, mediaType: 'movie' }));
        const seriesItems: SeriesItem[] = seriesData.map((item) => ({ ...item, mediaType: 'series' }));
        const allMedia: MediaItem[] = [...movieItems, ...seriesItems];

        const trendingItems: MediaItem[] = (trendingData.results || []).map((item: any) => ({
          id: item.tmdbId?.toString() || item.id,
          slug: item.slug,
          title: item.title,
          poster: item.poster,
          backdrop: item.backdrop,
          rating: item.rating,
          releaseDate: item.releaseDate,
          overview: item.overview,
          genres: item.genres || [],
          audioLanguages: [],
          subtitleLanguages: [],
          quality: item.quality || '1080p',
          sources: item.sources || [],
          mediaType: item.mediaType as 'movie' | 'series',
          runtime: item.runtime || '',
          fileSize: item.fileSize || '',
          totalSeasons: item.totalSeasons || 0,
          totalEpisodes: item.totalEpisodes || 0,
        }));

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

    fetchMedia();
  }, []);

  const allMedia = useMemo<MediaItem[]>(() => [...movies, ...series], [movies, series]);
  
  const trendingMedia = useMemo(() => {
    return [...allMedia].sort((a, b) => b.rating - a.rating).slice(0, 10);
  }, [allMedia]);

  const newReleases = useMemo(() => {
    return [...allMedia]
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, 10);
  }, [allMedia]);

  const topRated = useMemo(() => {
    return [...allMedia].sort((a, b) => b.rating - a.rating).slice(0, 10);
  }, [allMedia]);

  const categorySections = useMemo(() => {
    const genreCounts: Record<string, { count: number; items: MediaItem[] }> = {};
    
    allMedia.forEach((item) => {
      item.genres.slice(0, 2).forEach((genre) => {
        if (!genreCounts[genre]) {
          genreCounts[genre] = { count: 0, items: [] };
        }
        genreCounts[genre].count++;
        genreCounts[genre].items.push(item);
      });
    });

    return Object.entries(genreCounts)
      .filter(([_, data]) => data.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([genre, data]) => ({
        title: genre,
        slug: genre.toLowerCase().replace(/\s+/g, '-'),
        items: data.items.slice(0, 10),
      }));
  }, [allMedia, featured]);

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
  const progressMap = readWatchProgress();
  const featuredProgress = progressMap[featured.id];

  return (
    <main className="min-h-screen bg-[#0f171e] text-white pb-safe md:pb-0">
      <section className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '400px', maxHeight: '65vh' }}>
        <div className="absolute inset-0">
          <Image
            src={featured.backdrop}
            alt={featured.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f171e]/20 via-[#0f171e]/50 to-[#0f171e]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8 pt-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              {featured.ageRating && (
                <span className="inline-flex items-center rounded border border-white/30 bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  {featured.ageRating}
                </span>
              )}
              <span className="flex items-center gap-1 rounded border border-white/30 bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z" />
                </svg>
                {featured.rating.toFixed(1)}
              </span>
              <span className="rounded border border-white/30 bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {year}
              </span>
              {featured.quality && (
                <span className="rounded border border-[#00a8e1] bg-[#00a8e1]/20 px-2.5 py-0.5 text-xs font-semibold text-[#00a8e1]">
                  {featured.quality}
                </span>
              )}
            </div>

            <h1 className="mb-3 text-3xl font-bold leading-tight drop-shadow-lg sm:text-4xl lg:text-5xl">
              {featured.title}
            </h1>

            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-200 sm:text-base drop-shadow-md">
              {featured.overview}
            </p>

            {featuredProgress && (
              <div className="mb-3 max-w-sm">
                <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                  <span>Continue</span>
                  <span>{Math.round((featuredProgress.progress / featuredProgress.duration) * 100)}%</span>
                </div>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00a8e1] rounded-full" 
                    style={{ width: `${(featuredProgress.progress / featuredProgress.duration) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/watch/${featured.slug || featured.id}?source=${featured.sources[0]?.id}`}
                className="group flex items-center gap-2 rounded-sm bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-gray-200"
              >
                <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {featuredProgress ? 'Resume' : 'Play'}
              </Link>

              <Link
                href={`/movie/${featured.slug || featured.id}`}
                className="flex items-center gap-2 rounded-sm border border-white/40 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                More info
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {featured.genres.slice(0, 5).map((genre) => (
                <span key={genre} className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {genre}
                </span>
              ))}
              {isFeaturedSeries && (
                <span className="rounded bg-[#00a8e1]/20 px-3 py-1 text-xs font-semibold text-[#00a8e1]">
                  {featured.totalSeasons} Seasons • {featured.totalEpisodes} Episodes
                </span>
              )}
              {!isFeaturedSeries && featured.runtime && (
                <span className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {featured.runtime}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
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

        {newReleases.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">New Releases</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {newReleases.map((item) => (
                <MovieCard key={`new-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
              ))}
            </div>
          </section>
        )}

        {movies.length > 0 && (
          <section id="movies" className="scroll-mt-24">
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Movies</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {movies.map((item) => (
                <MovieCard key={`movie-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
              ))}
            </div>
          </section>
        )}

        {series.length > 0 && (
          <section id="series" className="scroll-mt-24">
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">TV Series</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {series.map((item) => (
                <MovieCard key={`series-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
              ))}
            </div>
          </section>
        )}

        {topRated.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Top Rated</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {topRated.map((item) => (
                <MovieCard key={`top-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
              ))}
            </div>
          </section>
        )}

        {categorySections.map((section) => (
          section.items.length > 0 && (
            <section key={section.title} id={section.slug} className="scroll-mt-24">
              <h2 className="mb-4 text-xl font-semibold sm:text-2xl">{section.title}</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {section.items.map((item) => (
                  <MovieCard key={`cat-${item.id}`} movie={item} className="w-[160px] sm:w-[200px] md:w-[240px] shrink-0" progress={progressMap[item.id]} />
                ))}
              </div>
            </section>
          )
        ))}
      </section>
    </main>
  );
}

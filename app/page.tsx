'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  if (typeof window === 'undefined') return {};
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

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`bg-[#222] rounded animate-pulse ${className}`}>
      <div className="h-full w-full bg-gradient-to-r from-[#222] via-[#2a2a2a] to-[#222] bg-[length:200%_100%] animate-shimmer" />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="bg-[#141414] min-h-screen">
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* Hero Skeleton */}
      <div className="relative h-[45vh] md:h-[400px] lg:h-[450px] bg-[#1a1a1a]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute left-4 md:left-16 bottom-8 max-w-xs md:max-w-xl">
          <div className="h-4 w-16 bg-[#222] rounded animate-pulse mb-2" />
          <div className="h-8 md:h-12 lg:h-14 w-3/4 bg-[#222] rounded animate-pulse mb-3" />
          <div className="flex gap-3 mb-3">
            <div className="h-4 w-12 bg-[#222] rounded animate-pulse" />
            <div className="h-4 w-12 bg-[#222] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[#222] rounded animate-pulse" />
          </div>
          <div className="h-4 w-full bg-[#222] rounded animate-pulse mb-2" />
          <div className="h-4 w-2/3 bg-[#222] rounded animate-pulse mb-4" />
          <div className="flex gap-3">
            <div className="h-8 w-20 bg-[#222] rounded animate-pulse" />
            <div className="h-8 w-20 bg-[#222] rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="px-9 mt-6 space-y-8">
        {/* Top 10 Skeleton */}
        <div className="space-y-3">
          <div className="h-7 w-56 bg-[#222] rounded animate-pulse" />
          <div className="flex gap-10 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="relative min-w-[230px] h-[220px]">
                <div className="absolute left-0 w-[180px] text-[180px] leading-none font-black text-transparent select-none" style={{ WebkitTextStroke: '2px #222' }}>{i + 1}</div>
                <div className="relative z-10 ml-16 w-[130px] h-[185px]">
                  <div className="w-full h-full bg-[#222] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Row Skeleton */}
        {Array.from({ length: 4 }, (_, rowIdx) => (
          <div key={rowIdx} className="space-y-3">
            <div className="h-7 w-40 bg-[#222] rounded animate-pulse" />
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 6 }, (_, i) => (
                <SkeletonCard key={i} className="shrink-0 w-[140px] h-[200px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NetflixFullHomePage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([]);
  const [trendingTmdb, setTrendingTmdb] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const progressMap = readWatchProgress();

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
  
  const heroItems = useMemo(() => {
    const items = [...trendingTmdb].slice(0, 5);
    if (items.length === 0 && allMedia.length > 0) {
      return [allMedia[0]];
    }
    return items;
  }, [trendingTmdb, allMedia]);
  
  const top10 = trendingTmdb.slice(0, 5).map((item, idx) => ({ ...item, rank: idx + 1 }));
  const continueWatchItems = continueWatching.slice(0, 8);

  if (loading) {
    return <HomeSkeleton />;
  }

  if (heroItems.length === 0) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-8 py-10 text-center">
          <p className="text-gray-200 text-lg">No content available</p>
          <Link href="/admin" className="mt-4 inline-block text-[#e50914] hover:text-[#b20710] transition-colors">
            Go to Admin
          </Link>
        </div>
    </div>
  );
}

function NetflixHeroCarousel({ items, progressMap }: { items: MediaItem[]; progressMap: WatchProgressMap }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const currentItem = items[currentIndex];
  const year = currentItem.releaseDate.split('-')[0];
  const itemProgress = progressMap[currentItem.id];
  const isSeries = currentItem.mediaType === 'series';

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1 || isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [items.length, isHovered, nextSlide]);

  if (!currentItem || items.length === 0) return null;

  return (
    <section 
      className="relative h-[45vh] md:h-[400px] lg:h-[450px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 transition-opacity duration-700">
        <Image
          src={currentItem.backdrop || currentItem.poster || '/placeholder.jpg'}
          alt={currentItem.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent md:from-black/80 md:via-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/30 to-transparent md:via-transparent" />

      <div className="absolute left-4 md:left-16 bottom-8 md:bottom-24 pr-12 md:pr-0 max-w-xs md:max-w-xl lg:max-w-2xl z-10">
        <p className="tracking-[5px] text-[10px] md:text-xs text-gray-400 uppercase font-sans">
          Netflix
        </p>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-wide mt-1 md:mt-2 leading-tight">
          {currentItem.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 md:mt-3 text-xs md:text-sm text-gray-300 font-sans">
          <span className="text-green-400 font-semibold text-[10px] md:text-sm">{Math.round(currentItem.rating * 10)}% Match</span>
          <span className="text-white/30 text-[10px]">|</span>
          <span className="text-[10px] md:text-sm">{year}</span>
          <span className="border border-white/30 px-1 text-[10px] md:text-xs">{currentItem.quality || 'HD'}</span>
          {currentItem.ageRating && <span className="bg-white/10 px-1 text-[10px] md:text-xs">{currentItem.ageRating}</span>}
          <span className="hidden md:inline text-white/50 text-xs">
            {isSeries ? `${(currentItem as SeriesItem).totalSeasons} Seasons` : (currentItem as MovieItem).runtime}
          </span>
        </div>

        <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-300 line-clamp-2 md:line-clamp-3 font-sans">
          {currentItem.overview}
        </p>

        <div className="flex gap-2 md:gap-3 mt-3 md:mt-5">
          <Link
            href={`/watch/${currentItem.slug || currentItem.id}?source=${currentItem.sources[0]?.id}`}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 sm:px-5 sm:py-2 rounded font-semibold text-sm sm:text-sm hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {itemProgress ? 'Resume' : 'Play'}
          </Link>
          <Link
            href="/favorites"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/10 backdrop-blur rounded hover:bg-white/20 transition-colors"
            aria-label="My List"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-8 h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {items.length > 1 && !isHovered && (
        <>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors z-20"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white overflow-x-hidden">

      {/* HERO CAROUSEL */}
      <NetflixHeroCarousel items={heroItems} progressMap={progressMap} />

      {/* REST OF CONTENT */}

      {/* REST OF CONTENT */}
      {top10.length > 0 && (
        <section className="px-9 mt-6">
          <h2 className="text-2xl font-semibold tracking-wide mb-6">
            Top 10 in Nigeria Today
          </h2>

          <div className="flex gap-10 overflow-x-auto pb-4 show-scrollbar lg:overflow-x-auto">
            {top10.map((movie) => (
              <Link
                key={movie.id}
                href={`/movie/${movie.slug || movie.id}`}
                className="relative min-w-[230px] h-[220px] flex items-center group"
              >
                <span
                  className="
                    absolute
                    left-0
                    text-[230px]
                    font-black
                    text-transparent
                    leading-none
                    z-0
                    select-none
                  "
                  style={{
                    WebkitTextStroke: '2px rgba(255,255,255,0.18)',
                  }}
                >
                  {movie.rank}
                </span>

                <div className="relative z-10 ml-16 w-[130px] h-[185px] rounded-md overflow-hidden">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CONTINUE WATCHING */}
      {continueWatchItems.length > 0 && (
        <section className="px-9 mt-6 pb-10">
          <h2 className="text-2xl font-semibold tracking-wide mb-5">
            Continue Watching
          </h2>

          <div className="flex gap-2 overflow-x-auto show-scrollbar lg:overflow-x-auto">
            {continueWatchItems.map((item) => (
              <Link
                key={item.id}
                href={`/movie/${item.slug || item.id}`}
                className="relative shrink-0 w-[140px] h-[80px] rounded-md overflow-hidden group"
              >
                <Image
                  src={item.poster}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {progressMap[item.id] && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                    <div
                      className="h-full bg-[#e50914]"
                      style={{ width: `${(progressMap[item.id].progress / progressMap[item.id].duration) * 100}%` }}
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* GENRE ROWS */}
      {[
        { label: 'Action Movies', genres: ['Action', 'Adventure', 'War'] },
        { label: 'Comedy', genres: ['Comedy'] },
        { label: 'Drama', genres: ['Drama', 'Family'] },
        { label: 'Thriller', genres: ['Thriller', 'Horror', 'Mystery'] },
        { label: 'Sci-Fi & Fantasy', genres: ['Science Fiction', 'Fantasy'] },
        { label: 'Romance', genres: ['Romance'] },
        { label: 'Animation', genres: ['Animation'] },
      ].map((section) => {
        const items = allMedia
          .filter(item => item.genres.some(g => section.genres.includes(g)))
          .slice(0, 8);
        if (items.length === 0) return null;
        
        return (
          <section key={section.label} className="px-9 mt-6 pb-4">
            <h2 className="text-2xl font-semibold tracking-wide mb-5">
              {section.label}
            </h2>
            <div className="flex gap-2 overflow-x-auto show-scrollbar lg:overflow-x-auto">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/movie/${item.slug || item.id}`}
                  className="relative shrink-0 w-[140px] h-[200px] rounded-md overflow-hidden group"
                >
                  <Image
                    src={item.poster}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {item.mediaType === 'series' && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] bg-[#e50914] px-1.5 py-0.5 rounded text-white">TV</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}

    </div>
  );
}
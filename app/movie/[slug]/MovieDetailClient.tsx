'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie, Series, Source } from '@/lib/types';

type MediaItem = Movie & { mediaType: 'movie' };
type MediaSeries = Series & { mediaType: 'series' };
type Media = MediaItem | MediaSeries;

function isMediaMovie(media: Media): media is MediaItem {
  return media.mediaType === 'movie';
}

interface FavoriteItem {
  id: string;
  slug?: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'series';
}

function isMediaSeries(media: Media): media is MediaSeries {
  return media.mediaType === 'series';
}

function readFavorites(): FavoriteItem[] {
  try {
    const stored = localStorage.getItem('favorites');
    if (!stored) {
      return [];
    }
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as FavoriteItem[];
  } catch (error) {
    console.error('Failed to read favorites:', error);
    return [];
  }
}

export default function MovieDetailClient() {
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = typeof slugParam === 'string' ? slugParam : undefined;

  const [movie, setMovie] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function fetchMovie() {
      if (!slug) {
        if (isMounted) {
          setError('Invalid slug');
          setLoading(false);
        }
        return;
      }

      const encodedParam = encodeURIComponent(slug);
      const candidates: Array<[string, 'movie' | 'series']> = [
        [`/api/movies?slug=${encodedParam}`, 'movie'],
        [`/api/movies?id=${encodedParam}`, 'movie'],
        [`/api/series?slug=${encodedParam}`, 'series'],
        [`/api/series?id=${encodedParam}`, 'series'],
      ];

      try {
        for (const [url, mediaType] of candidates) {
          const res = await fetch(url);
          if (!res.ok) {
            continue;
          }
          const data = await res.json();
          if (isMounted) {
            setMovie({ ...data, mediaType } as Media);
            setError('');
          }
          return;
        }

        if (isMounted) {
          setMovie(null);
          setError('Content not found');
        }
      } catch (fetchError) {
        console.error('Error fetching content:', fetchError);
        if (isMounted) {
          setMovie(null);
          setError('Failed to load');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMovie();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!movie) {
      return;
    }
    const favorites = readFavorites();
    setIsFavorite(favorites.some((item) => item.id === movie.id));
  }, [movie]);

  const seriesData = movie && isMediaSeries(movie) ? movie : null;
  const movieData = movie && isMediaMovie(movie) ? movie : null;
  const isSeries = Boolean(seriesData);
  const totalSeasons = seriesData?.totalSeasons ?? 1;
  const totalEpisodes = seriesData?.totalEpisodes ?? 0;
  const primarySource = movie?.sources.find((source) => source.active) || movie?.sources[0];

  useEffect(() => {
    if (selectedSeason > totalSeasons) {
      setSelectedSeason(1);
    }
  }, [selectedSeason, totalSeasons]);

  const toggleFavorite = () => {
    if (!movie) {
      return;
    }

    const favorites = readFavorites();
    if (favorites.some((item) => item.id === movie.id)) {
      const updated = favorites.filter((item) => item.id !== movie.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
      return;
    }

    const updated = [
      ...favorites,
      {
        id: movie.id,
        slug: movie.slug,
        title: movie.title,
        poster: movie.poster,
        mediaType: movie.mediaType,
      } satisfies FavoriteItem,
    ];
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f171e]">
        <div className="animate-pulse">
          <div className="h-[70vh] bg-[#1c2833]" />
          <div className="mx-auto max-w-7xl px-4 py-10 space-y-5">
            <div className="h-12 w-2/5 rounded bg-[#1c2833]" />
            <div className="h-5 w-3/5 rounded bg-[#1c2833]" />
            <div className="h-5 w-1/2 rounded bg-[#1c2833]" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f171e] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 text-lg">{error || 'Content not found'}</p>
          <Link href="/" className="mt-4 inline-block text-sky-400 hover:text-sky-300 transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const year = movie.releaseDate.split('-')[0];
  const subHeading = isSeries
    ? `${totalSeasons} Season${totalSeasons === 1 ? '' : 's'} | ${totalEpisodes} Episode${totalEpisodes === 1 ? '' : 's'}`
    : movieData?.runtime || 'N/A';

  return (
    <main className="min-h-screen bg-[#0f171e] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={movie.backdrop}
            alt={movie.title}
            fill
            priority
            className="object-cover object-top opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/95 to-[#0f171e]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/45 to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[230px_1fr] lg:items-end lg:px-8 lg:pt-16">
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-xl border border-white/15 shadow-2xl shadow-black/70">
              <Image
                src={movie.poster}
                alt={`${movie.title} poster`}
                width={230}
                height={345}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div className="max-w-3xl">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>

            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{movie.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-300 sm:gap-3">
              <span className="rounded-full border border-slate-500/40 px-3 py-1">{year}</span>
              <span className="rounded-full border border-slate-500/40 px-3 py-1">{movie.quality}</span>
              <span className="rounded-full border border-slate-500/40 px-3 py-1">{subHeading}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/40 px-3 py-1">
                <svg className="h-3.5 w-3.5 text-[#f5c451]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z" />
                </svg>
                {movie.rating}
              </span>
              {isSeries && (
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-sky-300">Series</span>
              )}
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              {movie.overview || 'No description available.'}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              {primarySource && (
                <Link
                  href={`/watch/${movie.slug || movie.id}?source=${primarySource.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#00a8e1] px-6 py-3 text-sm font-semibold text-[#051019] hover:bg-[#25baf0] transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play Now
                </Link>
              )}
              <button
                onClick={() => {
                  const details = document.getElementById('details-section');
                  details?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center rounded-md border border-slate-400/40 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-300 transition-colors"
              >
                More Details
              </button>
              <button
                onClick={toggleFavorite}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-400/40 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-300 transition-colors"
              >
                <svg
                  className={`h-4 w-4 ${isFavorite ? 'text-red-400' : ''}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {isFavorite ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-[#1f2b37] px-3 py-1 text-xs font-medium text-slate-200"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="details-section" className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_1.2fr] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#19232d] p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Details</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-slate-400">Release</p>
                <p className="mt-1 font-medium text-slate-100">{movie.releaseDate}</p>
              </div>
              <div>
                <p className="text-slate-400">Quality</p>
                <p className="mt-1 font-medium text-slate-100">{movie.quality}</p>
              </div>
              <div>
                <p className="text-slate-400">Rating</p>
                <p className="mt-1 font-medium text-slate-100">{movie.rating}</p>
              </div>
              <div>
                <p className="text-slate-400">Audio</p>
                <p className="mt-1 font-medium text-slate-100">{movie.audioLanguages.join(', ')}</p>
              </div>
              <div>
                <p className="text-slate-400">Subtitles</p>
                <p className="mt-1 font-medium text-slate-100">{movie.subtitleLanguages.join(', ')}</p>
              </div>
              <div>
                <p className="text-slate-400">{isSeries ? 'Seasons' : 'Runtime'}</p>
                <p className="mt-1 font-medium text-slate-100">{subHeading}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#19232d] p-5 sm:p-6">
            <h3 className="text-lg font-semibold">About</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
              {movie.overview || 'No description available.'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#19232d] p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Watch Options</h2>
            <div className="mt-4 space-y-3">
              {movie.sources.map((source: Source) => (
                <div
                  key={source.id}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#111a22] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        source.type === 'm3u8'
                          ? 'bg-sky-500/20 text-sky-300'
                          : source.type === 'mp4'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-violet-500/20 text-violet-300'
                      }`}
                    >
                      {source.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-slate-100">{source.name}</span>
                  </div>
                  <Link
                    href={`/watch/${movie.slug || movie.id}?source=${source.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#00a8e1] px-4 py-2 text-sm font-semibold text-[#051019] hover:bg-[#25baf0] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {isSeries && (
            <div className="rounded-xl border border-white/10 bg-[#19232d] p-5 sm:p-6">
              <h3 className="text-lg font-semibold">Episodes</h3>
              {totalSeasons > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {Array.from({ length: totalSeasons }, (_, index) => index + 1).map((season) => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        selectedSeason === season
                          ? 'bg-[#00a8e1] text-[#051019]'
                          : 'bg-[#111a22] text-slate-300 hover:text-white'
                      }`}
                    >
                      Season {season}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {Array.from({ length: totalEpisodes || 0 }, (_, index) => index + 1).map((episode) => (
                  <div
                    key={episode}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#111a22] px-4 py-3"
                  >
                    <p className="text-sm text-slate-200">
                      Episode {episode}
                      {totalSeasons > 1 ? ` | Season ${selectedSeason}` : ''}
                    </p>
                    {primarySource && (
                      <Link
                        href={`/watch/${movie.slug || movie.id}?source=${primarySource.id}&episode=${episode}`}
                        className="rounded-md bg-[#00a8e1] px-3 py-1.5 text-xs font-semibold text-[#051019] hover:bg-[#25baf0] transition-colors"
                      >
                        Play
                      </Link>
                    )}
                  </div>
                ))}
                {totalEpisodes === 0 && (
                  <p className="rounded-lg border border-white/10 bg-[#111a22] px-4 py-3 text-sm text-slate-400">
                    Episodes are not configured yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

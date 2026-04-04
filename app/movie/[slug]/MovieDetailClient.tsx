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

type TabType = 'overview' | 'episodes' | 'trailers' | 'more';

export default function MovieDetailClient() {
  const params = useParams();
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = typeof slugParam === 'string' ? slugParam : undefined;

  const [movie, setMovie] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [similarMedia, setSimilarMedia] = useState<Media[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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

  useEffect(() => {
    async function fetchSimilar() {
      if (!movie) return;
      
      const endpoint = movie.mediaType === 'movie' ? '/api/movies' : '/api/series';
      try {
        const res = await fetch(endpoint);
        const data: Media[] = await res.json();
        
        const similar = data
          .filter((m: Media) => 
            m.id !== movie.id && 
            m.genres.some((g: string) => movie.genres.includes(g))
          )
          .slice(0, 6);
        
        setSimilarMedia(similar);
      } catch (err) {
        console.error('Failed to fetch similar:', err);
      }
    }
    
    fetchSimilar();
  }, [movie]);

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
      <div className="min-h-screen bg-[#141414]">
        <div className="animate-pulse">
          <div className="h-[70vh] bg-[#1a1a1a]" />
          <div className="mx-auto max-w-7xl px-12 py-10 space-y-5">
            <div className="h-12 w-2/5 rounded bg-[#1a1a1a]" />
            <div className="h-5 w-3/5 rounded bg-[#1a1a1a]" />
            <div className="h-5 w-1/2 rounded bg-[#1a1a1a]" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg">{error || 'Content not found'}</p>
          <Link href="/" className="mt-4 inline-block text-[#e50914] hover:text-[#b20710] transition-colors">
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
    <main className="min-h-screen bg-[#141414] text-white pt-16 md:pt-20">
      <section className="px-4 md:px-12 py-6 md:py-8">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex gap-3 md:gap-8 items-center">
            <Link 
              href="/" 
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm ml-1 md:ml-2">Back</span>
            </Link>
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Browse</Link>
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Search</Link>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={toggleFavorite}
              className={`text-2xl ${isFavorite ? 'text-[#e50914]' : 'text-gray-400'}`}
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 md:gap-12 items-start">
          <div className="relative h-[280px] md:h-[520px] rounded-sm overflow-hidden bg-zinc-900">
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            {primarySource && (
              <Link 
                href={`/watch/${movie.slug || movie.id}?source=${primarySource.id}`}
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-[#e50914] w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-xl md:text-3xl rounded-full hover:bg-[#b20710] transition-colors"
              >
                ▶
              </Link>
            )}

            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
              {isSeries && (
                <>
                  <p className="text-xs md:text-sm font-medium">Resume</p>
                  <p className="text-xs md:text-sm mt-1 text-gray-300">
                    S{selectedSeason}:E{Math.min(1, totalEpisodes)}
                  </p>
                  <div className="h-[2px] bg-white/30 mt-2 md:mt-4 relative">
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-white" />
                  </div>
                </>
              )}
              <p className="text-[10px] md:text-xs text-gray-400 mt-2 md:mt-4 leading-4 line-clamp-2 md:line-clamp-3">
                {movie.overview || 'No description available.'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 tracking-wide text-xs md:text-sm">TeluguDub {isSeries ? 'ORIGINAL' : 'MOVIE'}</p>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-none mt-2">{movie.title}</h1>
                <div className="flex gap-2 md:gap-4 text-xs md:text-sm text-gray-400 mt-2 md:mt-4 flex-wrap">
                  <span>{year}</span>
                  <span>|</span>
                  {isSeries ? (
                    <>
                      <span>{totalSeasons} Season{totalSeasons === 1 ? '' : 's'}</span>
                      <span>|</span>
                    </>
                  ) : (
                    <>
                      <span>{movieData?.runtime || 'N/A'}</span>
                      <span>|</span>
                    </>
                  )}
                  <span>{movie.quality || 'HD'}</span>
                </div>
              </div>
              <div className="text-xl md:text-3xl font-light flex items-center gap-1 md:gap-2">
                <span>{movie.rating.toFixed(1)}</span>
                <span className="text-yellow-400">★</span>
              </div>
            </div>

            <div className="flex gap-3 md:gap-10 mt-4 md:mt-8 text-xs md:text-sm uppercase tracking-wide text-gray-400 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-white border-b-2 border-[#e50914]' : 'hover:text-white'}`}
              >
                Overview
              </button>
              {isSeries && (
                <button 
                  onClick={() => setActiveTab('episodes')}
                  className={`pb-2 transition-colors whitespace-nowrap ${activeTab === 'episodes' ? 'text-white border-b-2 border-[#e50914]' : 'hover:text-white'}`}
                >
                  Episodes
                </button>
              )}
              <button 
                onClick={() => setActiveTab('trailers')}
                className={`pb-2 transition-colors whitespace-nowrap ${activeTab === 'trailers' ? 'text-white border-b-2 border-[#e50914]' : 'hover:text-white'}`}
              >
                Trailers & More
              </button>
              <button 
                onClick={() => setActiveTab('more')}
                className={`pb-2 transition-colors ${activeTab === 'more' ? 'text-white border-b-2 border-[#e50914]' : 'hover:text-white'}`}
              >
                More Like This
              </button>
            </div>

            <div className="mt-4 md:mt-8">
              {activeTab === 'overview' && (
                <>
                  <p className="text-xs md:text-sm text-gray-300 max-w-2xl leading-5 md:leading-7">
                    {movie.overview || 'No description available.'}
                  </p>

                  <div className="mt-4 md:mt-8 space-y-2 md:space-y-3 text-xs md:text-sm">
                    <p>
                      <span className="text-gray-500 w-20 md:w-24 inline-block">Genre</span>
                      <span className="text-gray-300">{movie.genres.join(', ')}</span>
                    </p>
                    {isSeries && (
                      <p>
                        <span className="text-gray-500 w-20 md:w-24 inline-block">Seasons</span>
                        <span className="text-gray-300">{totalSeasons}</span>
                      </p>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'episodes' && isSeries && (
                <div className="space-y-4">
                  {totalSeasons > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {Array.from({ length: totalSeasons }, (_, index) => index + 1).map((season) => (
                        <button
                          key={season}
                          onClick={() => setSelectedSeason(season)}
                          className={`whitespace-nowrap rounded-sm px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-colors ${
                            selectedSeason === season
                              ? 'bg-[#e50914] text-white'
                              : 'bg-[#2a2a2a] text-gray-300 hover:text-white'
                          }`}
                        >
                          Season {season}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {Array.from({ length: totalEpisodes || 0 }, (_, index) => index + 1).map((episode) => (
                      <div key={episode} className="bg-[#2a2a2a] rounded overflow-hidden">
                        <div className="relative h-20 md:h-24">
                          <Image
                            src={movie.poster}
                            alt={`Episode ${episode}`}
                            fill
                            className="object-cover"
                          />
                          {primarySource && (
                            <Link 
                              href={`/watch/${movie.slug || movie.id}?source=${primarySource.id}&episode=${episode}`}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <span className="bg-[#e50914] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-sm md:text-lg">▶</span>
                            </Link>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gray-400">S{selectedSeason}:E{episode}</p>
                          <p className="text-sm mt-1">Episode {episode}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalEpisodes === 0 && (
                    <p className="text-sm text-gray-400">Episodes are not configured yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'trailers' && (
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
                  <div className="shrink-0 w-[160px] md:w-[200px] lg:w-[280px]">
                    <div className="relative h-24 md:h-32 lg:h-40 bg-[#2a2a2a] rounded flex items-center justify-center">
                      <span className="text-3xl md:text-4xl">▶</span>
                    </div>
                    <p className="text-xs md:text-sm mt-2 text-gray-300">Trailer</p>
                  </div>
                </div>
              )}

              {activeTab === 'more' && similarMedia.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
                  {similarMedia.map((item) => (
                    <Link
                      key={item.id}
                      href={`/movie/${item.slug || item.id}`}
                      className="group"
                    >
                      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#2a2a2a] transition-all duration-300 group-hover:scale-105">
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-1 md:bottom-2 left-2 right-2">
                          <p className="text-[10px] md:text-xs font-medium truncate text-white">{item.title}</p>
                          <p className="text-[9px] md:text-[10px] text-gray-400">★ {item.rating.toFixed(1)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
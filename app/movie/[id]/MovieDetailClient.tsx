'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie, Series } from '@/lib/models';
import SourceCard from '@/components/SourceCard';
import VideoPlayer from '@/components/VideoPlayer';

interface MediaItem extends Movie {
  mediaType: 'movie';
}

interface MediaSeries extends Series {
  mediaType: 'series';
}

export default function MovieDetailClient() {
  const params = useParams();
  const [movie, setMovie] = useState<(MediaItem | MediaSeries) | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingSource, setPlayingSource] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`/api/movies?id=${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setMovie({ ...data, mediaType: 'movie' as const });
        } else {
          const seriesRes = await fetch(`/api/series?id=${params.id}`);
          if (seriesRes.ok) {
            const seriesData = await seriesRes.json();
            setMovie({ ...seriesData, mediaType: 'series' as const });
          }
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchMovie();
    }
  }, [params.id]);

  const handleOpenSource = (source: any) => {
    setPlayingSource(source.id);
  };

  const handleWatchHere = (source: any) => {
    if (source.type === 'embed') {
      window.open(source.url, '_blank');
    } else {
      setPlayingSource(source.id);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-zinc-500 dark:text-zinc-400">Movie not found</p>
        <Link href="/" className="block text-center mt-4 text-zinc-900 dark:text-white hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  const year = movie.releaseDate.split('-')[0];
  const isSeries = movie.mediaType === 'series';
  const activeSources = movie.sources.filter((s: any) => s.active);
  const currentSource = playingSource 
    ? movie.sources.find((s: any) => s.id === playingSource)
    : activeSources[0];

  return (
    <main>
      {playingSource && currentSource && currentSource.type !== 'embed' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => setPlayingSource(null)}
            className="mb-4 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            ← Back to details
          </button>
          <VideoPlayer source={currentSource} />
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Watching: {movie.title} - {currentSource.name}
          </p>
        </div>
      )}

      <section className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <Image
            src={movie.backdrop}
            alt={movie.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/40 to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-40 h-60 sm:w-48 sm:h-72 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
              <Image
                src={movie.poster}
                alt={movie.title}
                width={192}
                height={288}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-yellow-500/90 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {movie.rating}
                </span>
                <span className="px-3 py-1 text-sm font-medium text-white bg-white/20 rounded-full backdrop-blur-sm">
                  {year}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm ${
                  isSeries ? 'bg-purple-500/90' : 'bg-blue-500/90'
                } text-white`}>
                  {isSeries ? 'Series' : 'Movie'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((genre: any) => (
                  <span key={genre} className="px-3 py-1 text-xs font-medium text-zinc-300 bg-white/10 rounded-full">
                    {genre}
                  </span>
                ))}
              </div>

              <p className="text-zinc-300 mb-6 line-clamp-2">{movie.overview}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Audio Languages</p>
            <div className="flex flex-wrap gap-2">
              {movie.audioLanguages.map((lang: any) => (
                <span key={lang} className="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded">
                  {lang}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Subtitle Languages</p>
            <div className="flex flex-wrap gap-2">
              {movie.subtitleLanguages.map((lang: any) => (
                <span key={lang} className="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded">
                  {lang}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Quality</p>
            <p className="font-semibold text-zinc-900 dark:text-white">{movie.quality}</p>
          </div>
          {isSeries ? (
            <>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Seasons</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{(movie as any).totalSeasons}</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Episodes</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{(movie as any).totalEpisodes}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Runtime</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{movie.runtime}</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">File Size</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{movie.fileSize}</p>
              </div>
            </>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Watch</h2>
          <div className="space-y-3">
            {movie.sources.map((source: any) => (
              <div key={source.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{source.name}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                      source.type === 'm3u8' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      source.type === 'mp4' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {source.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {source.type !== 'embed' && (
                    <button
                      onClick={() => handleWatchHere(source)}
                      className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                      Play Here
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenSource(source)}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie, Series } from '@/lib/models';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="animate-pulse">
          <div className="h-[85vh] bg-zinc-800" />
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="h-12 w-1/3 bg-zinc-800 rounded" />
            <div className="h-6 w-2/3 bg-zinc-800 rounded" />
            <div className="h-6 w-1/2 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Movie not found</p>
          <Link href="/" className="mt-4 inline-block text-zinc-500 hover:text-white transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const year = movie.releaseDate.split('-')[0];
  const isSeries = movie.mediaType === 'series';
  const primarySource = movie.sources.find(s => s.active) || movie.sources[0];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="relative w-full min-h-[85vh]">
        <div className="absolute inset-0">
          <Image
            src={movie.backdrop}
            alt={movie.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[30vh] pb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-green-400 font-medium">NETFLIX</span>
              <span className="text-zinc-400 text-sm">{year}</span>
              <span className="px-2 py-0.5 text-xs border border-zinc-600 rounded">{movie.quality}</span>
              {isSeries && (
                <span className="px-2 py-0.5 text-xs bg-purple-600 rounded">Series</span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold mb-4">{movie.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              {primarySource && (
                <Link
                  href={`/watch/${movie.id}?source=${primarySource.id}`}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
                </Link>
              )}
              <button
                onClick={() => {
                  const infoEl = document.getElementById('info-section');
                  infoEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-3 bg-zinc-500/50 rounded-lg hover:bg-zinc-500/70 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                More Info
              </button>
            </div>

            <p className="text-lg text-zinc-300 mb-6 line-clamp-3">{movie.overview}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre: any) => (
                <span key={genre} className="px-3 py-1 text-sm bg-zinc-800/50 rounded-full">
                  {genre}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Audio:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.audioLanguages.slice(0, 3).map((lang: any) => (
                    <span key={lang} className="text-zinc-300">{lang}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-zinc-500">Subtitles:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.subtitleLanguages.slice(0, 3).map((lang: any) => (
                    <span key={lang} className="text-zinc-300">{lang}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="info-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-500 text-sm mb-1">Rating</p>
            <p className="text-xl font-bold text-yellow-400">★ {movie.rating}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-500 text-sm mb-1">{isSeries ? 'Seasons' : 'Runtime'}</p>
            <p className="text-xl font-bold">{isSeries ? (movie as any).totalSeasons : movie.runtime}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-500 text-sm mb-1">Quality</p>
            <p className="text-xl font-bold">{movie.quality}</p>
          </div>
          {isSeries && (
            <div className="bg-zinc-900 p-4 rounded-lg">
              <p className="text-zinc-500 text-sm mb-1">Episodes</p>
              <p className="text-xl font-bold">{(movie as any).totalEpisodes}</p>
            </div>
          )}
          {!isSeries && (
            <div className="bg-zinc-900 p-4 rounded-lg">
              <p className="text-zinc-500 text-sm mb-1">File Size</p>
              <p className="text-xl font-bold">{movie.fileSize}</p>
            </div>
          )}
          <div className="bg-zinc-900 p-4 rounded-lg">
            <p className="text-zinc-500 text-sm mb-1">Sources</p>
            <p className="text-xl font-bold">{movie.sources.length}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Watch Options</h2>
        <div className="grid gap-3">
          {movie.sources.map((source: any) => (
            <div 
              key={source.id} 
              className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  source.type === 'm3u8' ? 'bg-blue-600' :
                  source.type === 'mp4' ? 'bg-green-600' : 'bg-purple-600'
                }`}>
                  {source.type.toUpperCase()}
                </span>
                <span className="font-medium">{source.name}</span>
              </div>
              <Link
                href={`/watch/${movie.id}?source=${source.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded font-medium hover:bg-zinc-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-zinc-400">{movie.overview || 'No description available.'}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="space-y-2 text-zinc-400">
              <p><span className="text-zinc-500">Release:</span> {movie.releaseDate}</p>
              <p><span className="text-zinc-500">Genres:</span> {movie.genres.join(', ')}</p>
              <p><span className="text-zinc-500">Audio:</span> {movie.audioLanguages.join(', ')}</p>
              <p><span className="text-zinc-500">Subtitles:</span> {movie.subtitleLanguages.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Movie, Series, Source } from '@/lib/types';
import VideoPlayer from '@/components/VideoPlayer';

type MediaItem = Movie & { mediaType: 'movie' };
type MediaSeries = Series & { mediaType: 'series' };

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sourceId = searchParams.get('source');
  
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Content not found</p>
          <Link href="/" className="mt-4 inline-block text-zinc-500 hover:text-white">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const currentSource = sourceId 
    ? movie.sources.find(s => s.id === sourceId)
    : movie.sources.find(s => s.active) || movie.sources[0];

  if (!currentSource) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">No sources available</p>
          <Link href={`/movie/${movie.slug || movie.id}`} className="mt-4 inline-block text-blue-400 hover:text-blue-300">
            Back to details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="relative">
        <div className="flex items-center gap-4 p-4 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
          <Link
            href={`/movie/${movie.slug || movie.id}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-white font-medium truncate">{movie.title}</h1>
          <span className="text-zinc-500 text-sm hidden sm:inline">- {currentSource.name}</span>
        </div>

        {currentSource.type === 'embed' ? (
          <div className="w-full h-[85vh]">
            <iframe
              src={currentSource.url}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            />
          </div>
        ) : (
          <VideoPlayer source={currentSource} />
        )}
      </div>

      <div className="p-4 bg-zinc-900">
        <h2 className="text-white font-medium mb-3">Other Sources</h2>
        <div className="flex flex-wrap gap-2">
          {movie.sources.map((source) => (
            <Link
              key={source.id}
              href={`/watch/${movie.id}?source=${source.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                source.id === currentSource.id
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {source.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

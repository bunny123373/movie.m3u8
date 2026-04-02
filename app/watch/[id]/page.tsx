'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Movie, Series } from '@/lib/types';
import VideoPlayer from '@/components/VideoPlayer';

type MediaItem = Movie & { mediaType: 'movie' };
type MediaSeries = Series & { mediaType: 'series' };
type Media = MediaItem | MediaSeries;

function WatchSkeleton() {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="animate-pulse">
        <div className="h-14 border-b border-white/10 bg-[#1a1a1a]" />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            <div className="aspect-video rounded-lg bg-[#1a1a1a]" />
            <div className="space-y-3 rounded-lg bg-[#1a1a1a] p-4">
              <div className="h-6 w-1/2 rounded bg-[#2a2a2a]" />
              <div className="h-12 w-full rounded bg-[#2a2a2a]" />
              <div className="h-12 w-full rounded bg-[#2a2a2a]" />
              <div className="h-12 w-full rounded bg-[#2a2a2a]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sourceId = searchParams.get('source');
  const episode = searchParams.get('episode');
  const slugOrId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [movie, setMovie] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      if (!slugOrId) {
        setLoading(false);
        return;
      }

      const encodedParam = encodeURIComponent(slugOrId);
      const candidates: Array<[string, 'movie' | 'series']> = [
        [`/api/movies?slug=${encodedParam}`, 'movie'],
        [`/api/movies?id=${encodedParam}`, 'movie'],
        [`/api/series?slug=${encodedParam}`, 'series'],
        [`/api/series?id=${encodedParam}`, 'series'],
      ];

      try {
        for (const [url, mediaType] of candidates) {
          const response = await fetch(url);
          if (!response.ok) {
            continue;
          }
          const data = await response.json();
          setMovie({ ...data, mediaType } as Media);
          return;
        }
        setMovie(null);
      } catch (error) {
        console.error('Error fetching watch content:', error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [slugOrId]);

  if (loading) {
    return <WatchSkeleton />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-8 py-10 text-center">
          <p className="text-gray-200 text-lg">Content not found</p>
          <Link href="/" className="mt-4 inline-block text-[#e50914] hover:text-[#b20710] transition-colors">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const currentSource = sourceId
    ? movie.sources.find((source) => source.id === sourceId)
    : movie.sources.find((source) => source.active) || movie.sources[0];

  if (!currentSource) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-8 py-10 text-center">
          <p className="text-gray-200 text-lg">No sources available</p>
          <Link
            href={`/movie/${movie.slug || movie.id}`}
            className="mt-4 inline-block text-[#e50914] hover:text-[#b20710] transition-colors"
          >
            Back to details
          </Link>
        </div>
      </div>
    );
  }

  const year = movie.releaseDate.split('-')[0];
  const playbackLabel = episode ? `Episode ${episode}` : 'Now Playing';

  return (
    <main className="min-h-screen bg-[#141414] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#1a1a1a]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link
              href={`/movie/${movie.slug || movie.id}`}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to details
            </Link>
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">{movie.title}</h1>
            <p className="truncate text-xs text-gray-500 sm:text-sm">
              {year} • {movie.quality} • {playbackLabel}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_350px] lg:px-8">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-black shadow-2xl shadow-black/50">
            {currentSource.type === 'embed' ? (
              <div className="aspect-video">
                <iframe
                  src={currentSource.url}
                  className="h-full w-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                />
              </div>
            ) : (
              <VideoPlayer key={`${currentSource.id}-${currentSource.url}`} source={currentSource} />
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg font-bold text-white">{movie.title}</span>
              <span className="rounded bg-[#e50914] px-2 py-0.5 text-xs font-bold text-white">{movie.quality}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{movie.overview || 'No overview available.'}</p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-4 text-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Title</span>
                <span className="text-gray-200 text-right max-w-[180px] truncate">{movie.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Year</span>
                <span className="text-gray-200">{year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quality</span>
                <span className="text-gray-200">{movie.quality}</span>
              </div>
              {episode && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Episode</span>
                  <span className="text-gray-200">Episode {episode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Rating</span>
                <span className="text-yellow-500">★ {movie.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

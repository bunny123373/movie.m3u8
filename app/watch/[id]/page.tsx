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
    <div className="min-h-screen bg-[#0f171e] text-white">
      <div className="animate-pulse">
        <div className="h-16 border-b border-white/10 bg-[#16202a]" />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="aspect-video rounded-xl border border-white/10 bg-[#1b2530]" />
            <div className="space-y-3 rounded-xl border border-white/10 bg-[#16202a] p-4">
              <div className="h-5 w-1/2 rounded bg-[#1b2530]" />
              <div className="h-10 w-full rounded bg-[#1b2530]" />
              <div className="h-10 w-full rounded bg-[#1b2530]" />
              <div className="h-10 w-full rounded bg-[#1b2530]" />
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
      <div className="min-h-screen bg-[#0f171e] flex items-center justify-center">
        <div className="rounded-xl border border-white/10 bg-[#16202a] px-8 py-10 text-center">
          <p className="text-slate-200 text-lg">Content not found</p>
          <Link href="/" className="mt-4 inline-block text-[#00a8e1] hover:text-[#25baf0] transition-colors">
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
      <div className="min-h-screen bg-[#0f171e] flex items-center justify-center">
        <div className="rounded-xl border border-white/10 bg-[#16202a] px-8 py-10 text-center">
          <p className="text-slate-200 text-lg">No sources available</p>
          <Link
            href={`/movie/${movie.slug || movie.id}`}
            className="mt-4 inline-block text-[#00a8e1] hover:text-[#25baf0] transition-colors"
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
    <main className="min-h-screen bg-[#0f171e] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#101922]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link
              href={`/movie/${movie.slug || movie.id}`}
              className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to details
            </Link>
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">{movie.title}</h1>
            <p className="truncate text-xs text-slate-400 sm:text-sm">
              {year} | {movie.quality} | {playbackLabel}
            </p>
          </div>
          <span className="hidden rounded-full border border-slate-500/40 px-3 py-1 text-xs text-slate-300 sm:inline-flex">
            {currentSource.name}
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/40">
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

          <div className="rounded-xl border border-white/10 bg-[#16202a] p-4">
            <p className="text-sm text-slate-300">{movie.overview || 'No overview available.'}</p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#16202a] p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Sources</h2>
            <div className="space-y-2">
              {movie.sources.map((source) => {
                const query = new URLSearchParams();
                query.set('source', source.id);
                if (episode) {
                  query.set('episode', episode);
                }

                return (
                  <Link
                    key={source.id}
                    href={`/watch/${movie.slug || movie.id}?${query.toString()}`}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                      source.id === currentSource.id
                        ? 'border-[#00a8e1] bg-[#00a8e1]/20 text-white'
                        : 'border-white/10 bg-[#111a22] text-slate-300 hover:border-slate-400/40'
                    }`}
                  >
                    <span className="truncate">Server {source.priority}</span>
                    <span className="rounded bg-black/40 px-2 py-0.5 text-[11px] uppercase">{source.type}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#16202a] p-4 text-sm text-slate-300">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Playback Info</h3>
            <div className="space-y-1.5">
              <p>Title: {movie.title}</p>
              <p>Year: {year}</p>
              <p>Quality: {movie.quality}</p>
              <p>Server: {currentSource.priority}</p>
              <p>Type: {currentSource.type.toUpperCase()}</p>
              {episode && <p>Episode: {episode}</p>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

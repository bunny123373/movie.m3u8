'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/models';
import SourceCard from '@/components/SourceCard';

export default function MovieDetailClient() {
  const params = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`/api/movies?id=${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setMovie(data);
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

  const handleOpenSource = (source: Movie['sources'][0]) => {
    if (source.url) {
      window.open(source.url, '_blank');
    }
  };

  return (
    <main>
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
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((genre) => (
                  <span key={genre} className="px-3 py-1 text-xs font-medium text-zinc-300 bg-white/10 rounded-full">
                    {genre}
                  </span>
                ))}
              </div>

              <p className="text-zinc-300 mb-6">{movie.overview}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Audio Languages</p>
            <div className="flex flex-wrap gap-2">
              {movie.audioLanguages.map((lang) => (
                <span key={lang} className="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded">
                  {lang}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Subtitle Languages</p>
            <div className="flex flex-wrap gap-2">
              {movie.subtitleLanguages.map((lang) => (
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
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Runtime</p>
            <p className="font-semibold text-zinc-900 dark:text-white">{movie.runtime}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">File Size</p>
            <p className="font-semibold text-zinc-900 dark:text-white">{movie.fileSize}</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Sources</p>
            <p className="font-semibold text-zinc-900 dark:text-white">{movie.sources.length} Sources Available</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Sources</h2>
          <div className="space-y-3">
            {movie.sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onOpen={handleOpenSource}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

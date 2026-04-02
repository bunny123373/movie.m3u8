'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { Source } from '@/lib/types';

interface VideoPlayerProps {
  source: Source;
  subtitles?: { label: string; url: string; lang: string }[];
  poster?: string;
  title?: string;
}

function normalizeEmbedUrl(rawUrl: string): string {
  let embedUrl = rawUrl.trim();
  if (!embedUrl.startsWith('http') && !embedUrl.startsWith('//')) {
    embedUrl = `//${embedUrl}`;
  }
  if (embedUrl.startsWith('http:')) {
    embedUrl = embedUrl.replace('http:', 'https:');
  }
  return embedUrl;
}

function EmbedPlayer({ source }: { source: Source }) {
  const embedUrl = normalizeEmbedUrl(source.url);

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        title="Video embed"
        className="h-full w-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      />
    </div>
  );
}

function VideoPlayerContent({ source, subtitles = [], poster, title }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const playerInstance = useRef<any>(null);

  const isEmbed = source.type === 'embed';

  useEffect(() => {
    if (isEmbed || !containerRef.current) {
      setLoading(false);
      return;
    }

    const initPlayer = async () => {
      try {
        setLoading(true);
        
        const container = containerRef.current!;
        container.innerHTML = '';
        
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://cdn.vidstack.io/player';
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          setTimeout(() => reject(new Error('Timeout')), 10000);
        });

        const { VidstackPlayer, VidstackPlayerLayout } = (window as any).VidstackPlayerLib || { 
          create: async () => {
            const container = document.createElement('div');
            container.innerHTML = `
              <video class="vidstack-player" controls crossorigin="anonymous" playsinline>
                <source src="${source.url}" type="application/x-mpegURL" />
              </video>
            `;
            return container.querySelector('video');
          }
        };
        
        if (VidstackPlayer && VidstackPlayer.create) {
          const player = await VidstackPlayer.create({
            target: container,
            title: title || source.name,
            src: source.url,
            poster: poster || '',
            layout: new VidstackPlayerLayout({
              thumbnails: poster || '',
            }),
          });
          
          playerInstance.current = player;
          
          player.addEventListener('error', () => {
            setError(true);
            setLoading(false);
          });
          
          player.addEventListener('loaded', () => {
            setLoading(false);
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to create Vidstack player:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (playerInstance.current) {
        try {
          playerInstance.current.destroy();
        } catch (e) {}
        playerInstance.current = null;
      }
    };
  }, [source, isEmbed, poster, title]);

  if (isEmbed) {
    return <EmbedPlayer source={source} />;
  }

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-sm text-white/80">Loading stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-10">
          <div className="text-center">
            <p className="mb-3 text-sm text-red-400">Failed to load this source.</p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white hover:text-white/80 underline"
            >
              Open source directly
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideoPlayer(props: VideoPlayerProps) {
  return (
    <Suspense fallback={
      <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    }>
      <VideoPlayerContent {...props} />
    </Suspense>
  );
}

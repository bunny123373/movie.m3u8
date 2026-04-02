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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vidstackRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playerType, setPlayerType] = useState<'vidstack'>('vidstack');

  const isEmbed = source.type === 'embed';

  const getStreamType = (url: string): 'm3u8' | 'mp4' | 'unknown' => {
    if (url.includes('.m3u8') || url.includes('m3u8')) return 'm3u8';
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mkv')) return 'mp4';
    return 'unknown';
  };

  const initVidstackPlayer = async () => {
    if (!containerRef.current) return false;
    
    try {
      const vidstackScript = document.createElement('script');
      vidstackScript.src = 'https://cdn.vidstack.io/player';
      vidstackScript.type = 'module';
      document.head.appendChild(vidstackScript);

      await new Promise((resolve, reject) => {
        vidstackScript.onload = resolve;
        vidstackScript.onerror = reject;
        setTimeout(() => reject(new Error('Timeout')), 8000);
      });

      const { VidstackPlayer, VidstackPlayerLayout } = (window as any).VidstackPlayerLib || { 
        create: async () => null 
      };
      
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        
        const player = await VidstackPlayer.create({
          target: containerRef.current,
          title: title || source.name,
          src: source.url,
          poster: poster || '',
          layout: new VidstackPlayerLayout({
            thumbnails: poster || '',
          }),
          autoplay: true,
          playsinline: true,
          crossorigin: 'anonymous',
        });

        vidstackRef.current = player;
        
        player.addEventListener('loaded', () => {
          setLoading(false);
        });
        
        player.addEventListener('error', () => {
          setLoading(false);
          setError(true);
        });

        setPlayerType('vidstack');
        return true;
      }
    } catch (err) {
      console.warn('Vidstack failed, trying HLS:', err);
    }
    return false;
  };

  useEffect(() => {
    if (isEmbed) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    setPlayerType('vidstack');

    const init = async () => {
      const vidstackOk = await initVidstackPlayer();
      if (!vidstackOk) {
        setError(true);
      }
      if (loading) setLoading(false);
    };

    init();

    return () => {
      if (vidstackRef.current) {
        try {
          vidstackRef.current.destroy();
        } catch (e) {}
        vidstackRef.current = null;
      }
    };
  }, [source]);

  if (isEmbed) {
    return <EmbedPlayer source={source} />;
  }

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative">
      {playerType === 'vidstack' ? (
        <div ref={containerRef} className="w-full h-full" />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          controls
          poster={poster}
          crossOrigin="anonymous"
          controlsList="nodownload"
        />
      )}
      
      <div className="absolute top-2 left-2 z-20 flex gap-2">
        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded border border-white/20">
          Vidstack
        </span>
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-sm text-white/80">Loading Vidstack player...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-10">
          <div className="text-center">
            <p className="mb-3 text-sm text-red-400">Failed to load stream</p>
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

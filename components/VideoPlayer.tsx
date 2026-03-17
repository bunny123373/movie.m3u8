'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Hls from 'hls.js';
import { Source } from '@/lib/types';

interface VideoPlayerProps {
  source: Source;
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

function VideoPlayerContent({ source }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isEmbed = source.type === 'embed';

  useEffect(() => {
    if (isEmbed) {
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    setLoading(true);
    setError(false);

    const handleCanPlay = () => setLoading(false);
    const handleError = () => {
      setError(true);
      setLoading(false);
    };

    if (source.type === 'm3u8' || source.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        try {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });

          hlsRef.current = hls;
          hls.loadSource(source.url);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            video.play().catch(() => {});
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              handleError();
            }
          });
        } catch (e) {
          handleError();
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source.url;
        video.addEventListener('loadedmetadata', handleCanPlay);
        video.addEventListener('error', handleError);
      } else {
        handleError();
      }
    } else {
      video.src = source.url;
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleCanPlay);
      video.removeEventListener('error', handleError);
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {}
        hlsRef.current = null;
      }
    };
  }, [source, isEmbed]);

  if (isEmbed) {
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

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
      />

      <div className="absolute top-4 right-4 flex gap-2">
        <span className="px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded text-xs font-medium text-white">
          {source.type.toUpperCase()}
        </span>
        <span className="px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded text-xs font-medium text-white">
          {source.name}
        </span>
      </div>

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
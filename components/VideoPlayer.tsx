'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function VideoPlayer({ source }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(source.type !== 'embed');
  const [error, setError] = useState(false);

  const isEmbed = source.type === 'embed';

  useEffect(() => {
    if (isEmbed) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleLoaded = () => setLoading(false);
    const handleError = () => {
      setError(true);
      setLoading(false);
    };

    if (source.type === 'm3u8' || source.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
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
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source.url;
        video.addEventListener('loadedmetadata', handleLoaded);
        video.addEventListener('error', handleError);
      } else {
        handleError();
      }
    } else {
      video.src = source.url;
      video.addEventListener('loadeddata', handleLoaded);
      video.addEventListener('error', handleError);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('error', handleError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source, isEmbed]);

  if (isEmbed) {
    const embedUrl = normalizeEmbedUrl(source.url);

    return (
      <div className="w-full aspect-video bg-black">
        <iframe
          src={embedUrl}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      <video ref={videoRef} controls className="h-full w-full" playsInline />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#061118]/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00a8e1] border-t-transparent" />
            <p className="text-sm text-slate-200">Loading stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#061118]/85">
          <div className="text-center">
            <p className="mb-3 text-sm text-red-300">Failed to load this source.</p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#00a8e1] hover:text-[#25baf0] transition-colors"
            >
              Open source directly
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

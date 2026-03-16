'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Source } from '@/lib/models';

interface VideoPlayerProps {
  source: Source;
}

export default function VideoPlayer({ source }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (source.type === 'm3u8') {
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
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setError(true);
            setLoading(false);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source.url;
        video.addEventListener('loadedmetadata', () => {
          setLoading(false);
          video.play().catch(() => {});
        });
      } else {
        setError(true);
        setLoading(false);
      }
    } else if (source.type === 'mp4') {
      video.src = source.url;
      video.addEventListener('loadeddata', () => setLoading(false));
      video.addEventListener('error', () => {
        setError(true);
        setLoading(false);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [source]);

  if (source.type === 'embed') {
    return (
      <div className="flex items-center justify-center h-96 bg-zinc-900 rounded-xl">
        <p className="text-zinc-400">Embed sources cannot be played inline</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative">
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        playsInline
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Loading...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-red-400 mb-3">Failed to load video</p>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline text-sm"
            >
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

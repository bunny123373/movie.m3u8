'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Hls from 'hls.js';
import { Source } from '@/lib/types';

interface VideoPlayerProps {
  source: Source;
  subtitles?: { label: string; url: string; lang: string }[];
  poster?: string;
  title?: string;
}

interface QualityLevel {
  height: number;
  index: number;
  bitrate: number;
  label: string;
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
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);

  const isEmbed = source.type === 'embed';

  useEffect(() => {
    if (isEmbed || !videoRef.current) {
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    setLoading(true);
    setError(false);

    const handleCanPlay = () => setLoading(false);
    const handleError = () => {
      setError(true);
      setLoading(false);
    };

    if (source.type === 'm3u8' || source.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hlsRef.current = hls;
        hls.loadSource(source.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setLoading(false);
          const levels: QualityLevel[] = data.levels.map((level: any, index: number) => ({
            height: level.height,
            index,
            bitrate: level.bitrate,
            label: `${level.height}p`,
          }));
          setQualities(levels);
          if (levels.length > 0) {
            setCurrentQuality(levels[levels.length - 1].height);
          }
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          if (hlsRef.current) {
            setCurrentQuality(hlsRef.current.levels[data.level]?.height || -1);
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            handleError();
          }
        });
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

  const handleQualityChange = (height: number) => {
    if (!hlsRef.current) return;
    const levelIndex = hlsRef.current.levels.findIndex(l => l.height === height);
    if (levelIndex !== -1) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(height);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (e) {}
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  if (isEmbed) {
    return <EmbedPlayer source={source} />;
  }

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative">
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        controls
        poster={poster}
        crossOrigin="anonymous"
      />
      
      {!loading && qualities.length > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <select
            value={currentQuality}
            onChange={(e) => handleQualityChange(parseInt(e.target.value))}
            className="bg-black/70 text-white text-xs px-2 py-1 rounded border border-white/20"
          >
            <option value={-1}>Auto</option>
            {qualities.map(q => (
              <option key={q.height} value={q.height}>{q.label}</option>
            ))}
          </select>
        </div>
      )}

      {loading && !error && (
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

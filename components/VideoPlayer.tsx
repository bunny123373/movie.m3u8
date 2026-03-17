'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Hls from 'hls.js';
import { Source } from '@/lib/types';

interface VideoPlayerProps {
  source: Source;
  subtitles?: { label: string; url: string; lang: string }[];
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

function PlaybackSpeedMenu({ 
  currentSpeed, 
  onChange 
}: { 
  currentSpeed: number; 
  onChange: (speed: number) => void 
}) {
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
      >
        {currentSpeed}x
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl border border-white/10">
          {speeds.map(speed => (
            <button
              key={speed}
              onClick={() => { onChange(speed); setOpen(false); }}
              className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                currentSpeed === speed ? 'text-orange-500' : 'text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QualityMenu({
  qualities,
  currentQuality,
  onChange
}: {
  qualities: QualityLevel[];
  currentQuality: number;
  onChange: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = qualities.find(q => q.height === currentQuality);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded text-white transition-colors flex items-center gap-1"
      >
        {current?.label || 'Auto'}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl border border-white/10 max-h-60 overflow-y-auto">
          <button
            onClick={() => { onChange(-1); setOpen(false); }}
            className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
              currentQuality === -1 ? 'text-orange-500' : 'text-white'
            }`}
          >
            Auto
          </button>
          {qualities.map(q => (
            <button
              key={q.index}
              onClick={() => { onChange(q.index); setOpen(false); }}
              className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                currentQuality === q.index ? 'text-orange-500' : 'text-white'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SubtitleMenu({
  subtitles,
  currentTrack,
  onChange
}: {
  subtitles: { label: string; url: string; lang: string }[];
  currentTrack: number;
  onChange: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-white hover:bg-white/10 rounded transition-colors"
        title="Subtitles"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-[#1a1a1a] rounded-lg overflow-hidden shadow-xl border border-white/10">
          <button
            onClick={() => { onChange(-1); setOpen(false); }}
            className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
              currentTrack === -1 ? 'text-orange-500' : 'text-white'
            }`}
          >
            Off
          </button>
          {subtitles.map((sub, i) => (
            <button
              key={i}
              onClick={() => { onChange(i); setOpen(false); }}
              className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                currentTrack === i ? 'text-orange-500' : 'text-white'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoPlayerContent({ source, subtitles = [] }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isEmbed = source.type === 'embed';

  useEffect(() => {
    if (isEmbed) {
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(false);
    setQualities([]);

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

          hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
            setLoading(false);
            const levels: QualityLevel[] = data.levels.map((level, index) => ({
              height: level.height,
              index,
              bitrate: level.bitrate,
              label: `${level.height}p`,
            }));
            setQualities(levels);
            video.play().catch(() => {});
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
            if (currentQuality === -1 && hls.autoLevelEnabled) {
              setCurrentQuality(hls.maxAutoLevel);
            }
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

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (hlsRef.current && currentQuality !== -1) {
      hlsRef.current.currentLevel = currentQuality;
    }
  }, [currentQuality]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !subtitles.length) return;

    if (currentSubtitle === -1) {
      video.textTracks[0] && (video.textTracks[0].mode = 'disabled');
    } else {
      for (let i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = 'hidden';
      }
      const track = video.addTextTrack('subtitles', subtitles[currentSubtitle].label, subtitles[currentSubtitle].lang);
      (track as any).src = subtitles[currentSubtitle].url;
      track.mode = 'showing';
    }
  }, [currentSubtitle, subtitles]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
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
    } catch (e) {
      console.error('PiP error:', e);
    }
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
    <div 
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        onClick={() => {
          if (videoRef.current?.paused) {
            videoRef.current.play();
          } else {
            videoRef.current?.pause();
          }
        }}
      />

      {showControls && !loading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-4 px-4 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-orange-600 rounded text-xs font-medium text-white">
                {source.type.toUpperCase()}
              </span>
              <span className="text-xs text-white/80">{source.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {qualities.length > 0 && (
                <QualityMenu
                  qualities={qualities}
                  currentQuality={currentQuality}
                  onChange={setCurrentQuality}
                />
              )}
              
              <PlaybackSpeedMenu
                currentSpeed={playbackSpeed}
                onChange={setPlaybackSpeed}
              />
              
              {subtitles.length > 0 && (
                <SubtitleMenu
                  subtitles={subtitles}
                  currentTrack={currentSubtitle}
                  onChange={setCurrentSubtitle}
                />
              )}
              
              <button
                onClick={togglePiP}
                className="p-1.5 text-white hover:bg-white/10 rounded transition-colors"
                title="Picture-in-Picture"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h10M18 14v4" />
                </svg>
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-white hover:bg-white/10 rounded transition-colors"
                title="Fullscreen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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

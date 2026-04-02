'use client';

import { Suspense } from 'react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Source } from '@/lib/types';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

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
  const isEmbed = source.type === 'embed';

  if (isEmbed) {
    return <EmbedPlayer source={source} />;
  }

  return (
    <MediaPlayer
      src={source.url}
      poster={poster}
      title={title || `Server ${source.priority}`}
      autoplay
      playsinline
      crossOrigin="anonymous"
      className="w-full aspect-video bg-black rounded-xl overflow-hidden"
    >
      <MediaProvider />
      <DefaultVideoLayout thumbnails={poster} icons={defaultLayoutIcons} />
    </MediaPlayer>
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

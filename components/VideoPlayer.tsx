'use client';

import { useState } from 'react';
import { Source } from '@/lib/models';

interface VideoPlayerProps {
  source: Source;
}

export default function VideoPlayer({ source }: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        src={source.url}
        controls
        autoPlay
        className="w-full h-full"
        onLoadedData={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onPlay={() => setLoading(false)}
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

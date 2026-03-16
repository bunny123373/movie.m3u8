'use client';

import { useState, useRef } from 'react';
import { Source } from '@/lib/models';

interface VideoPlayerProps {
  source: Source;
}

export default function VideoPlayer({ source }: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (source.type !== 'mp4' && source.type !== 'm3u8') {
    return (
      <div className="flex items-center justify-center h-96 bg-zinc-900 rounded-xl">
        <p className="text-zinc-400">This source type cannot be played inline</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      {source.type === 'mp4' ? (
        <video
          ref={videoRef}
          src={source.url}
          controls
          autoPlay
          className="w-full h-full"
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-400">
            HLS streams require a compatible player. 
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-400 hover:underline"
            >
              Open in new tab
            </a>
          </p>
        </div>
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="text-red-400">Failed to load video</p>
        </div>
      )}
    </div>
  );
}

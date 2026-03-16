'use client';

import { useState, useEffect } from 'react';

interface WatchProgress {
  [mediaId: string]: {
    progress: number;
    duration: number;
    updatedAt: number;
  };
}

export function useWatchProgress() {
  const [progress, setProgress] = useState<WatchProgress>({});

  useEffect(() => {
    const stored = localStorage.getItem('watchProgress');
    if (stored) {
      setProgress(JSON.parse(stored));
    }
  }, []);

  const updateProgress = (mediaId: string, currentTime: number, duration: number) => {
    const newProgress = {
      ...progress,
      [mediaId]: {
        progress: currentTime,
        duration,
        updatedAt: Date.now(),
      },
    };
    setProgress(newProgress);
    localStorage.setItem('watchProgress', JSON.stringify(newProgress));
  };

  const getProgress = (mediaId: string) => {
    return progress[mediaId] || null;
  };

  const clearProgress = (mediaId: string) => {
    const newProgress = { ...progress };
    delete newProgress[mediaId];
    setProgress(newProgress);
    localStorage.setItem('watchProgress', JSON.stringify(newProgress));
  };

  const getContinueWatching = () => {
    return Object.entries(progress)
      .filter(([_, data]) => data.progress > 0 && data.progress < data.duration * 0.95)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
      .slice(0, 10);
  };

  return { progress, updateProgress, getProgress, clearProgress, getContinueWatching };
}

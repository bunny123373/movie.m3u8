'use client';

import { useState, useEffect } from 'react';

interface FavoriteItem {
  id: string;
  slug: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'series';
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const addFavorite = (item: FavoriteItem) => {
    if (!favorites.find(f => f.id === item.id)) {
      const updated = [...favorites, item];
      setFavorites(updated);
      localStorage.setItem('favorites', JSON.stringify(updated));
    }
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const isFavorite = (id: string) => {
    return favorites.some(f => f.id === id);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
}

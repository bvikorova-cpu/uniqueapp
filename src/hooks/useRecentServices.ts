import { useState, useCallback } from 'react';

const STORAGE_KEY = 'unique_recent_services';
const FAVORITES_KEY = 'unique_favorite_services';
const MAX_RECENT = 8;

export function useRecentServices() {
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch { return []; }
  });

  const trackVisit = useCallback((path: string) => {
    setRecent(prev => {
      const updated = [path, ...prev.filter(p => p !== path)].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((path: string) => {
    setFavorites(prev => {
      const updated = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback((path: string) => favorites.includes(path), [favorites]);

  return { recent, favorites, trackVisit, toggleFavorite, isFavorite };
}

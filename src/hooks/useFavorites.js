import { useEffect, useState } from 'react';

const STORAGE_KEY = 'shopcart_favorites';

function readFavorites() {
  if (typeof window === 'undefined') return [];

  try {
    const storedFavorites = window.localStorage.getItem(STORAGE_KEY);
    if (!storedFavorites) return [];

    const parsedFavorites = JSON.parse(storedFavorites);
    if (!Array.isArray(parsedFavorites)) return [];

    return [...new Set(parsedFavorites.filter((id) => typeof id === 'string' && id.length > 0))];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Keep favorite interactions available when storage is unavailable or full.
    }
  }, [favorites]);

  const toggleFavorite = (productId) => {
    if (typeof productId !== 'string' || productId.length === 0) return;

    setFavorites((currentFavorites) => (
      currentFavorites.includes(productId)
        ? currentFavorites.filter((id) => id !== productId)
        : [...currentFavorites, productId]
    ));
  };

  const isFavorite = (productId) => favorites.includes(productId);
  const clearFavorites = () => setFavorites([]);

  return { favorites, toggleFavorite, isFavorite, clearFavorites };
}

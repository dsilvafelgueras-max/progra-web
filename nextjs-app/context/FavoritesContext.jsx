'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sangria-favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  function toggle(productId) {
    setFavorites((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem('sangria-favorites', JSON.stringify(next));
      return next;
    });
  }

  function isFavorite(productId) {
    return favorites.includes(productId);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

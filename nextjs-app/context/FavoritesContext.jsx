'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext(null);
const LS_KEY = 'sangria-favorites';

function getToken() {
  try { return localStorage.getItem('sangria-token'); } catch { return null; }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // Cargar al montar: Supabase si hay token, localStorage si no
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.ok ? r.json() : null)
        .then((ids) => { if (ids) setFavorites(ids); })
        .catch(() => {});
    } else {
      try {
        const stored = localStorage.getItem(LS_KEY);
        if (stored) setFavorites(JSON.parse(stored));
      } catch {}
    }
  }, []);

  async function toggle(productId) {
    const token = getToken();
    const alreadySaved = favorites.includes(productId);

    // Actualización optimista
    setFavorites((prev) =>
      alreadySaved ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    if (token) {
      if (alreadySaved) {
        await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      }
    } else {
      // Sin sesión: guardar en localStorage
      setFavorites((prev) => {
        const next = prev;
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        return next;
      });
    }
  }

  function isFavorite(productId) {
    return favorites.includes(productId);
  }

  // Recargar desde Supabase cuando el usuario inicia sesión
  function reloadFromServer() {
    const token = getToken();
    if (!token) return;
    fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((ids) => { if (ids) setFavorites(ids); })
      .catch(() => {});
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite, reloadFromServer }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

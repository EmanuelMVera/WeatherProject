import { useCallback, useEffect, useRef, useState } from "react";
import { readJson, STORAGE_KEYS, writeJson } from "../lib/storage.js";
import { isValidPlace, toPlace } from "../domain/location.js";

export const MAX_FAVORITES = 12;

/** Lee favoritos descartando entradas corruptas y duplicadas. */
export function loadFavorites() {
  const raw = readJson(STORAGE_KEYS.favorites, Array.isArray, []);
  const seen = new Set();
  return raw
    .filter(isValidPlace)
    .map((p) => toPlace(p, "favorite"))
    .filter((p) => p && !seen.has(p.id) && seen.add(p.id))
    .slice(0, MAX_FAVORITES);
}

/**
 * Favoritos persistidos en localStorage (sin cuentas ni servidor).
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites);
  const [storageError, setStorageError] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setStorageError(!writeJson(STORAGE_KEYS.favorites, favorites));
  }, [favorites]);

  const isFavorite = useCallback((id) => favorites.some((f) => f.id === id), [favorites]);

  const addFavorite = useCallback((place) => {
    const normalized = toPlace(place, "favorite");
    if (!normalized) return;
    setFavorites((prev) =>
      prev.some((f) => f.id === normalized.id) || prev.length >= MAX_FAVORITES ? prev : [...prev, normalized]
    );
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const toggleFavorite = useCallback(
    (place) => {
      if (favorites.some((f) => f.id === place.id)) removeFavorite(place.id);
      else addFavorite(place);
    },
    [favorites, addFavorite, removeFavorite]
  );

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFull: favorites.length >= MAX_FAVORITES,
    storageError,
  };
}

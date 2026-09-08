import { useCallback, useEffect, useRef, useState } from "react";
import { MIN_QUERY_LENGTH, searchPlaces } from "../services/geoClient.js";

const DEBOUNCE_MS = 300;

/**
 * Lógica del buscador predictivo de ubicaciones: debounce, cancelación de
 * peticiones en vuelo y navegación por teclado.
 *
 * @returns {{
 *   query: string,
 *   results: import("../services/geoClient.js").Place[],
 *   open: boolean,
 *   activeIndex: number,
 *   loading: boolean,
 *   error: string | null,
 *   onQueryChange: (value: string) => void,
 *   openList: () => void,
 *   closeList: () => void,
 *   moveActive: (delta: number) => void,
 *   selectAt: (index: number) => (import("../services/geoClient.js").Place | null),
 *   clear: () => void,
 * }}
 */
export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const controllerRef = useRef(null);

  const cancelPending = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  // Limpieza al desmontar.
  useEffect(() => cancelPending, [cancelPending]);

  const runSearch = useCallback((term) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    searchPlaces(term, { signal: controller.signal })
      .then((places) => {
        if (controller.signal.aborted) return;
        setResults(places);
        setActiveIndex(places.length > 0 ? 0 : -1);
        setOpen(true);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResults([]);
        setActiveIndex(-1);
        setError(err?.message || "Error al buscar ubicaciones.");
        setOpen(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, []);

  const onQueryChange = useCallback(
    (value) => {
      setQuery(value);
      cancelPending();

      const term = value.trim();
      if (term.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setActiveIndex(-1);
        setError(null);
        setLoading(false);
        setOpen(false);
        return;
      }

      setLoading(true);
      setOpen(true);
      debounceRef.current = setTimeout(() => runSearch(term), DEBOUNCE_MS);
    },
    [cancelPending, runSearch]
  );

  const openList = useCallback(() => {
    if (results.length > 0 || error) setOpen(true);
  }, [results.length, error]);

  const closeList = useCallback(() => setOpen(false), []);

  const moveActive = useCallback(
    (delta) => {
      const count = results.length;
      if (count === 0) return;
      setActiveIndex((idx) => (idx + delta + count) % count);
      setOpen(true);
    },
    [results.length]
  );

  const selectAt = useCallback(
    (index) => {
      const place = results[index] || null;
      if (place) {
        cancelPending();
        setQuery(place.label);
        setResults([]);
        setActiveIndex(-1);
        setOpen(false);
        setError(null);
        setLoading(false);
      }
      return place;
    },
    [results, cancelPending]
  );

  const clear = useCallback(() => {
    cancelPending();
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    setOpen(false);
    setError(null);
    setLoading(false);
  }, [cancelPending]);

  return {
    query,
    results,
    open,
    activeIndex,
    loading,
    error,
    onQueryChange,
    openList,
    closeList,
    moveActive,
    selectAt,
    clear,
  };
}

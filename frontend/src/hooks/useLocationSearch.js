import { useCallback, useEffect, useRef, useState } from "react";
import { MIN_QUERY_LENGTH, searchPlaces } from "../services/geoClient.js";

export const DEBOUNCE_MS = 300;

/**
 * Lógica del buscador predictivo: debounce, cancelación de peticiones en
 * vuelo y descarte de respuestas viejas (cada búsqueda tiene un id; sólo la
 * última puede actualizar el estado).
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
  const requestIdRef = useRef(0);

  const cancelPending = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    controllerRef.current?.abort();
    controllerRef.current = null;
    requestIdRef.current += 1; // invalida cualquier respuesta en vuelo
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const runSearch = useCallback((term) => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;
    const isCurrent = () => requestId === requestIdRef.current && !controller.signal.aborted;

    searchPlaces(term, { signal: controller.signal })
      .then((places) => {
        if (!isCurrent()) return;
        setResults(places);
        setActiveIndex(places.length > 0 ? 0 : -1);
        setError(null);
        setOpen(true);
      })
      .catch((err) => {
        if (!isCurrent()) return;
        setResults([]);
        setActiveIndex(-1);
        setError(err?.message || "No pudimos buscar localidades.");
        setOpen(true);
      })
      .finally(() => {
        if (isCurrent()) setLoading(false);
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

  const clear = useCallback(() => {
    cancelPending();
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    setOpen(false);
    setError(null);
    setLoading(false);
  }, [cancelPending]);

  /** Devuelve el resultado elegido y limpia el buscador. */
  const selectAt = useCallback(
    (index) => {
      const place = results[index] ?? null;
      if (place) clear();
      return place;
    },
    [results, clear]
  );

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

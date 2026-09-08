import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCityFromIp,
  fetchWeatherBundle,
  warmUpServer,
} from "../services/weatherClient.js";
import { COLD_START_HINT_MS } from "../utils/http.js";

const FALLBACK_CITY = "Buenos Aires";

/**
 * Normaliza lo que llega desde la UI (string de ciudad, o place con lat/lon)
 * a lo que entiende `fetchWeatherBundle`.
 * @param {string | { name?: string, latitude?: number, longitude?: number }} input
 * @returns {{ request: object, label: string } | null}
 */
function normalizeLocation(input) {
  if (!input) return null;

  if (typeof input === "string") {
    const city = input.trim();
    return city ? { request: { city }, label: city } : null;
  }

  const lat = Number(input.latitude);
  const lon = Number(input.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return {
      request: { lat, lon },
      label: (input.name && String(input.name).trim()) || `${lat}, ${lon}`,
    };
  }

  const city = input.name ? String(input.name).trim() : "";
  return city ? { request: { city }, label: city } : null;
}

/**
 * @param {string|undefined} apiUrl
 */
export function useWeather(apiUrl) {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // true cuando la petición se está demorando por el cold start de Render.
  const [wakingUp, setWakingUp] = useState(false);

  const lastLocationRef = useRef(null);
  const activeControllerRef = useRef(null);
  const wakingTimerRef = useRef(null);

  const clearWakingTimer = useCallback(() => {
    if (wakingTimerRef.current) {
      clearTimeout(wakingTimerRef.current);
      wakingTimerRef.current = null;
    }
  }, []);

  const beginLoading = useCallback(() => {
    setLoading(true);
    setWakingUp(false);
    clearWakingTimer();
    // Si tarda más de lo normal, avisamos "servidor despertando" sin mostrar error.
    wakingTimerRef.current = setTimeout(
      () => setWakingUp(true),
      COLD_START_HINT_MS
    );
  }, [clearWakingTimer]);

  const endLoading = useCallback(() => {
    clearWakingTimer();
    setLoading(false);
    setWakingUp(false);
  }, [clearWakingTimer]);

  const loadWeatherForCity = useCallback(
    async (location) => {
      const normalized = normalizeLocation(location);
      if (!normalized || !apiUrl) return;

      // Cancela una búsqueda anterior en curso (cambio rápido de ubicación).
      activeControllerRef.current?.abort();
      const controller = new AbortController();
      activeControllerRef.current = controller;

      lastLocationRef.current = location;
      beginLoading();

      try {
        const data = await fetchWeatherBundle(apiUrl, normalized.request, {
          signal: controller.signal,
          onWakingUp: () => setWakingUp(true),
        });
        setWeatherData(data);
        setError(null);
        setShowErrorModal(false);
      } catch (err) {
        if (controller.signal.aborted) return; // reemplazada por otra búsqueda
        setError(err?.message || "Error al obtener datos");
        setShowErrorModal(true);
      } finally {
        if (activeControllerRef.current === controller) endLoading();
      }
    },
    [apiUrl, beginLoading, endLoading]
  );

  useEffect(() => {
    if (!apiUrl) {
      setLoading(false);
      setError("API no configurada");
      setShowErrorModal(true);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      // Despierta Render en paralelo (no bloquea, no gasta rate-limit).
      warmUpServer(apiUrl, { signal: controller.signal });

      beginLoading();
      try {
        const city = await fetchCityFromIp(apiUrl, {
          signal: controller.signal,
          onWakingUp: () => {
            if (!cancelled) setWakingUp(true);
          },
        });
        if (cancelled) return;
        await loadWeatherForCity(city || FALLBACK_CITY);
      } catch {
        // Falló la geolocalización -> usamos la ciudad por defecto.
        // loadWeatherForCity maneja su propio error/modal internamente.
        if (!cancelled) await loadWeatherForCity(FALLBACK_CITY);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      activeControllerRef.current?.abort();
      clearWakingTimer();
    };
  }, [apiUrl, loadWeatherForCity, beginLoading, clearWakingTimer]);

  const handleCloseModal = useCallback(() => {
    setShowErrorModal(false);
    setError(null);
  }, []);

  const handleRetry = useCallback(() => {
    handleCloseModal();
    loadWeatherForCity(lastLocationRef.current || FALLBACK_CITY);
  }, [loadWeatherForCity, handleCloseModal]);

  return {
    weatherData,
    error,
    showErrorModal,
    loading,
    wakingUp,
    fetchWeatherData: loadWeatherForCity,
    handleCloseModal,
    handleRetry,
  };
}

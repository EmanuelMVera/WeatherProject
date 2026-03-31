import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCityFromIp,
  fetchWeatherBundle,
} from "../services/weatherClient.js";

/**
 * Retry logic with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} delayMs - Initial delay in milliseconds
 */
async function retryAsync(fn, maxAttempts = 2, delayMs = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Don't retry on "City not found" errors
      if (err.message === "Ciudad no encontrada") {
        throw err;
      }

      // If it's the last attempt, throw
      if (attempt === maxAttempts) {
        throw err;
      }

      // Wait before retrying
      console.warn(
        `Attempt ${attempt} failed: ${err.message}. Retrying in ${delayMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * @param {string|undefined} apiUrl
 */
 
  const FALLBACK_CITY = "Buenos Aires";
 
export function useWeather(apiUrl) {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastCityRef = useRef(null);
  

  const loadWeatherForCity = useCallback(
    async (city) => {
      if (!city || !apiUrl) return;

      lastCityRef.current = city;
      setLoading(true);
      try {
        const data = await retryAsync(
          () => fetchWeatherBundle(apiUrl, city),
          2,
          2000
        );
        setWeatherData(data);
        setError(null);
        setShowErrorModal(false);
      } catch (err) {
        const message = err?.message || "Error al obtener datos";
        setError(message);
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    if (!apiUrl) {
      setLoading(false);
      setError("API no configurada");
      setShowErrorModal(true);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const city = await retryAsync(() => fetchCityFromIp(apiUrl), 2, 1500);
        if (cancelled) return;

        if (!city) {
          setError("No se pudo obtener la ciudad");
          setShowErrorModal(true);
          setLoading(false);
          return;
        }

        await loadWeatherForCity(city);
      } catch (err) {
  if (!cancelled) {
    try {
      await loadWeatherForCity(FALLBACK_CITY);
    } catch (fallbackErr) {
      const fallbackMessage = fallbackErr?.message || "Error al obtener datos";
      setError(fallbackMessage);
      setShowErrorModal(true);
      setLoading(false);
    }
  }
}
    })();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, loadWeatherForCity]);

  const handleCloseModal = useCallback(() => {
    setShowErrorModal(false);
    setError(null);
  }, []);

  const handleRetry = useCallback(() => {
  handleCloseModal();
  loadWeatherForCity(lastCityRef.current || FALLBACK_CITY);
}, [loadWeatherForCity, handleCloseModal]);

  return {
    weatherData,
    error,
    showErrorModal,
    loading,
    fetchWeatherData: loadWeatherForCity,
    handleCloseModal,
    handleRetry,
  };
}

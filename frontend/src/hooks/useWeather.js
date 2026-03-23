import { useState, useEffect, useCallback } from "react";
import {
  fetchCityFromIp,
  fetchWeatherBundle,
} from "../services/weatherClient.js";

/**
 * @param {string|undefined} apiUrl
 */
export function useWeather(apiUrl) {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWeatherForCity = useCallback(
    async (city) => {
      if (!city || !apiUrl) return;

      setLoading(true);
      try {
        const data = await fetchWeatherBundle(apiUrl, city);
        setWeatherData(data);
        setError(null);
        setShowErrorModal(false);
      } catch (err) {
        const message =
          err.message === "Ciudad no encontrada"
            ? err.message
            : "Error al obtener datos";
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
        const city = await fetchCityFromIp(apiUrl);
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
          setError(err?.message || "Error al obtener ubicación");
          setShowErrorModal(true);
          setLoading(false);
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

  return {
    weatherData,
    error,
    showErrorModal,
    loading,
    fetchWeatherData: loadWeatherForCity,
    handleCloseModal,
  };
}

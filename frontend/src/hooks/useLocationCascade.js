import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
} from "../services/locationClient.js";

const INITIAL_LOADING = { countries: false, states: false, cities: false };

/**
 * Encapsula la lógica de la cascada País ➔ Estado ➔ Ciudad:
 * carga de datos, selección, reseteo de niveles inferiores y manejo de errores.
 *
 * @returns {{
 *   countries: Array,
 *   states: Array,
 *   cities: Array,
 *   selectedCountry: string,
 *   selectedState: string,
 *   selectedCity: string,
 *   loading: { countries: boolean, states: boolean, cities: boolean },
 *   error: string | null,
 *   selectCountry: (iso2: string) => void,
 *   selectState: (iso2: string) => void,
 *   selectCity: (id: string) => (object | null),
 * }}
 */
export function useLocationCascade() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [loading, setLoading] = useState(INITIAL_LOADING);
  const [error, setError] = useState(null);

  // Evita que respuestas viejas (de una selección anterior) pisen el estado actual.
  const requestIdRef = useRef(0);

  // 1. Cargar países al montar.
  useEffect(() => {
    let cancelled = false;
    setLoading((prev) => ({ ...prev, countries: true }));
    setError(null);

    fetchCountries()
      .then((data) => {
        if (!cancelled) setCountries(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Error al cargar países.");
      })
      .finally(() => {
        if (!cancelled) setLoading((prev) => ({ ...prev, countries: false }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Seleccionar país ➔ cargar estados, resetear estado/ciudad.
  const selectCountry = useCallback((countryIso2) => {
    const requestId = ++requestIdRef.current;

    setSelectedCountry(countryIso2);
    setSelectedState("");
    setSelectedCity("");
    setStates([]);
    setCities([]);
    setError(null);

    if (!countryIso2) return;

    setLoading((prev) => ({ ...prev, states: true }));
    fetchStates(countryIso2)
      .then((data) => {
        if (requestId === requestIdRef.current) setStates(data);
      })
      .catch((err) => {
        if (requestId === requestIdRef.current) {
          setError(err?.message || "Error al cargar estados/provincias.");
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setLoading((prev) => ({ ...prev, states: false }));
        }
      });
  }, []);

  // 3. Seleccionar estado ➔ cargar ciudades, resetear ciudad.
  const selectState = useCallback(
    (stateIso2) => {
      const requestId = ++requestIdRef.current;

      setSelectedState(stateIso2);
      setSelectedCity("");
      setCities([]);
      setError(null);

      if (!stateIso2 || !selectedCountry) return;

      setLoading((prev) => ({ ...prev, cities: true }));
      fetchCities(selectedCountry, stateIso2)
        .then((data) => {
          if (requestId === requestIdRef.current) setCities(data);
        })
        .catch((err) => {
          if (requestId === requestIdRef.current) {
            setError(err?.message || "Error al cargar ciudades.");
          }
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setLoading((prev) => ({ ...prev, cities: false }));
          }
        });
    },
    [selectedCountry]
  );

  // 4. Seleccionar ciudad ➔ devolver el objeto completo (name, latitude, longitude).
  const selectCity = useCallback(
    (cityId) => {
      setSelectedCity(cityId);
      if (!cityId) return null;
      return cities.find((city) => String(city.id) === String(cityId)) || null;
    },
    [cities]
  );

  return {
    countries,
    states,
    cities,
    selectedCountry,
    selectedState,
    selectedCity,
    loading,
    error,
    selectCountry,
    selectState,
    selectCity,
  };
}

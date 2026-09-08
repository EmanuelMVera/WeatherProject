import React, { useCallback } from "react";
import styles from "./LocationCascadeSearch.module.css";
import { useLocationCascade } from "../../hooks/useLocationCascade";

/**
 * Buscador de ubicaciones en cascada: País ➔ Estado/Provincia ➔ Ciudad.
 * Al elegir una ciudad extrae { name, latitude, longitude } y dispara la
 * búsqueda de clima.
 *
 * @param {{
 *   fetchWeatherData: (city: string) => void,
 *   onCitySelected?: (city: { name: string, latitude: string, longitude: string }) => void,
 * }} props
 */
const LocationCascadeSearch = ({ fetchWeatherData, onCitySelected }) => {
  const {
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
  } = useLocationCascade();

  const handleCountryChange = useCallback(
    (event) => selectCountry(event.target.value),
    [selectCountry]
  );

  const handleStateChange = useCallback(
    (event) => selectState(event.target.value),
    [selectState]
  );

  // Event listener final: extrae nombre, lat y lon y busca el clima.
  const handleCityChange = useCallback(
    (event) => {
      const city = selectCity(event.target.value);
      if (!city) return;

      const { name, latitude, longitude } = city;

      // Función "simulada" de búsqueda de clima por coordenadas.
      searchWeatherByCoords({ name, latitude, longitude });

      // Callback opcional para el consumidor (uso futuro: clima por lat/lon).
      onCitySelected?.({ name, latitude, longitude });

      // Flujo de clima real existente (por nombre de ciudad).
      fetchWeatherData(name);
    },
    [selectCity, onCitySelected, fetchWeatherData]
  );

  const countriesDisabled = loading.countries || countries.length === 0;
  const statesDisabled = !selectedCountry || loading.states;
  const citiesDisabled = !selectedState || loading.cities;

  return (
    <section className={styles.container} aria-label="Buscador de ubicación">
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="country-select" className={styles.label}>
            País
          </label>
          <select
            id="country-select"
            className={styles.select}
            value={selectedCountry}
            onChange={handleCountryChange}
            disabled={countriesDisabled}
          >
            <option value="">
              {loading.countries ? "Cargando países..." : "Seleccioná un país"}
            </option>
            {countries.map((country) => (
              <option key={country.id} value={country.iso2}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="state-select" className={styles.label}>
            Estado / Provincia
          </label>
          <select
            id="state-select"
            className={styles.select}
            value={selectedState}
            onChange={handleStateChange}
            disabled={statesDisabled}
          >
            <option value="">
              {loading.states
                ? "Cargando estados..."
                : selectedCountry && states.length === 0
                ? "Sin estados disponibles"
                : "Seleccioná un estado"}
            </option>
            {states.map((state) => (
              <option key={state.id} value={state.iso2}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="city-select" className={styles.label}>
            Ciudad
          </label>
          <select
            id="city-select"
            className={styles.select}
            value={selectedCity}
            onChange={handleCityChange}
            disabled={citiesDisabled}
          >
            <option value="">
              {loading.cities
                ? "Cargando ciudades..."
                : selectedState && cities.length === 0
                ? "Sin ciudades disponibles"
                : "Seleccioná una ciudad"}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  );
};

/**
 * Función simulada: en un caso real acá se llamaría a un endpoint de clima
 * por coordenadas (ej: `${apiUrl}/currentWeather?lat=..&lon=..`).
 * @param {{ name: string, latitude: string, longitude: string }} location
 */
function searchWeatherByCoords({ name, latitude, longitude }) {
  console.log("[searchWeatherByCoords] Buscando clima para:", {
    name,
    latitude,
    longitude,
  });
}

export default React.memo(LocationCascadeSearch);

import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { fetchCurrentWeather } from "../utils/fetchCurrentWeather.js";
import { fetchWeatherForecasts } from "../utils/fetchWeatherForecasts.js";
import styles from "./styles/citySearch.module.css";

const CitySearch = ({ setDatos, location }) => {
  const [city, setCity] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location && !searchCity) {
      buscarCiudad(location.city); // Usar la ciudad obtenida por IP como búsqueda inicial
    }
  }, [location, searchCity]);

  const buscarCiudad = useCallback(
    async (ciudad) => {
      try {
        const [currentWeather, weatherForecasts] = await Promise.all([
          fetchCurrentWeather(ciudad),
          fetchWeatherForecasts(ciudad),
        ]);

        setError(null);
        setDatos(
          currentWeather,
          weatherForecasts["dailyForecast"],
          weatherForecasts["hourlyForecast"]
        );
        setSearchCity(ciudad);
      } catch (error) {
        console.error("Error fetching city data:", error);
        setError("Error fetching city data");
      }
    },
    [setDatos]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      buscarCiudad(city);
      setCity("");
    },
    [city, buscarCiudad]
  );

  return (
    <div className={styles.citySearchContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ingrese nombre de ciudad..."
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Buscar
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

CitySearch.propTypes = {
  setDatos: PropTypes.func.isRequired,
};

export default CitySearch;

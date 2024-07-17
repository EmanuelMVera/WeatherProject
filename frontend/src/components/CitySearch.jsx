import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./styles/citySearch.module.css";

const CitySearch = ({ setDatos, location }) => {
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location && !city) {
      buscarCiudad(location.cityName); // Usar la ciudad obtenida por IP como búsqueda inicial
    }
  }, [location, city]);

  const buscarCiudad = useCallback(
    async (ciudad) => {
      try {
        const currentWeatherResponse = await fetch(
          `http://localhost:3001/currentWeather?city=${ciudad}`
        );
        const forecastWeatherResponse = await fetch(
          `http://localhost:3001/forecastWeather?city=${ciudad}`
        );

        if (!currentWeatherResponse.ok || !forecastWeatherResponse.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const currentWeather = await currentWeatherResponse.json();
        const weatherForecasts = await forecastWeatherResponse.json();

        setDatos(
          currentWeather,
          weatherForecasts.dailyForecast,
          weatherForecasts.hourlyForecast
        );
        setCity(ciudad);
        setError(null);
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

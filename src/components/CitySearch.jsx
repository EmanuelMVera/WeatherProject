import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { fetchCurrentWeather } from "../utils/fetchCurrentWeather.js";
// import { fetchHourlyForecast } from "../utils/fetchHourlyForecast.js";
// import { fetchDailyForecast } from "../utils/fetchDailyForecast.js";
import styles from "./styles/citySearch.module.css";
import { fetchWeatherForecasts } from "../utils/fetchWeatherForecasts.js";

const CitySearch = ({ setDatos }) => {
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);

  const buscarCiudad = useCallback(
    async (ciudad) => {
      try {
        const [
          currentWeather,
          // hourlyForecast,
          // dailyForecast,
          weatherForecasts,
        ] = await Promise.all([
          fetchCurrentWeather(ciudad),
          // fetchHourlyForecast(ciudad),
          // fetchDailyForecast(ciudad),
          fetchWeatherForecasts(ciudad),
        ]);

        setError(null);
        setDatos(
          currentWeather,
          weatherForecasts["dailyForecast"],
          weatherForecasts["hourlyForecast"]
        );
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
          Buscar Ciudad
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

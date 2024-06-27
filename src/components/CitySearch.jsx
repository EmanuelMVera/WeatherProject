import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { fetchWeatherData } from "../utils/fetchApiWeather.js";
import styles from "./styles/citySearch.module.css";
import { fetchForecastData } from "../utils/fetchApiForecast.js";

const CitySearch = ({ setDatos }) => {
  const [city, setCity] = useState("");
  const [state, setState] = useState({
    error: null,
    weather: null,
    forecast: null,
  });

  const buscarCiudad = useCallback(
    async (ciudad) => {
      try {
        const weatherData = await fetchWeatherData(ciudad);
        const forecastData = await fetchForecastData(ciudad);

        setState({
          error: null,
          weather: weatherData,
          forecast: forecastData,
        });

        setDatos(weatherData, forecastData);
      } catch (error) {
        console.error("Error fetching city data:", error);
        setState((prevState) => ({
          ...prevState,
          error: "Error fetching city data",
        }));
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

  const handleInputChange = useCallback((event) => {
    setCity(event.target.value);
  }, []);

  return (
    <div className={styles.citySearchContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          name="name"
          placeholder="Enter city name"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Buscar Ciudad
        </button>
      </form>
      {state.error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

CitySearch.propTypes = {
  setDatos: PropTypes.func.isRequired,
};

export default CitySearch;

import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { fetchCurrentWeather } from "../utils/fetchCurrentWeather.js";
import { fetchHourlyForecast } from "../utils/fetchHourlyForecast.js";
import { fetchDailyForecast } from "../utils/fetchDailyForecast.js";
import styles from "./styles/citySearch.module.css";

const CitySearch = ({ setDatos }) => {
  const [city, setCity] = useState("");
  const [state, setState] = useState({
    error: null,
    currentWeather: null,
    hourlyForecast: null,
    dailyForecast: null,
  });

  const buscarCiudad = useCallback(
    async (ciudad) => {
      try {
        const currentWeather = await fetchCurrentWeather(ciudad);
        const hourlyForecast = await fetchHourlyForecast(ciudad);
        const dailyForecast = await fetchDailyForecast(ciudad);

        setState({
          error: null,
          currentWeather,
          hourlyForecast,
          dailyForecast,
        });

        setDatos(currentWeather, dailyForecast, hourlyForecast);
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
      {state.error && <p className={styles.error}>{state.error}</p>}
    </div>
  );
};

CitySearch.propTypes = {
  setDatos: PropTypes.func.isRequired,
};

export default CitySearch;

import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./styles/citySearch.module.css";

const CitySearch = ({ fetchWeatherData }) => {
  const [city, setCity] = useState("");

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (city.trim()) {
        fetchWeatherData(city);
        setCity("");
      }
    },
    [city, fetchWeatherData]
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
    </div>
  );
};

CitySearch.propTypes = {
  fetchWeatherData: PropTypes.func.isRequired,
};

export default CitySearch;

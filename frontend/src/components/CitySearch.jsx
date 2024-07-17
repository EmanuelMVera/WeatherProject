import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./styles/citySearch.module.css";

const CitySearch = ({ fetchWeatherData }) => {
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      fetchWeatherData(city);
      setCity("");
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
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

CitySearch.propTypes = {
  fetchWeatherData: PropTypes.func.isRequired,
};

export default CitySearch;

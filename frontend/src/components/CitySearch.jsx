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
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Ciudad..."
        className={styles.input}
      />
    </form>
  );
};

CitySearch.propTypes = {
  fetchWeatherData: PropTypes.func.isRequired,
};

export default CitySearch;

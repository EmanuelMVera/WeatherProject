import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./CitySearch.module.css";

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
    <section className={styles.citySearchContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Buscar ciudad (ej: Madrid, Cordoba, Lima)"
          className={styles.input}
          aria-label="Buscar ciudad"
        />
        <button type="submit" className={styles.button}>
          Buscar
        </button>
      </form>
    </section>
  );
};

CitySearch.propTypes = {
  fetchWeatherData: PropTypes.func.isRequired,
};

export default CitySearch;

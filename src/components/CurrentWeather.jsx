import React from "react";
import styles from "./styles/currentWeather.module.css";

const CurrentWeather = ({ currentWeather }) => {
  return (
    <div className={styles.currentWeather}>
      <div className={styles.temperature}>
        <span className={styles.temp}>{currentWeather.current.temp_c}°</span>
        <img
          src={currentWeather.current.condition.icon}
          alt="weather icon"
          className={styles.weatherIcon}
        />
      </div>
      <div className={styles.weatherDetails}>
        <span>{currentWeather.current.condition.text}</span>
        <span>Precip: {currentWeather.current.precip_mm}%</span>
        <span>Humedad: {currentWeather.current.humidity}%</span>
        <span>Viento: {currentWeather.current.wind_kph} km/h</span>
      </div>
    </div>
  );
};

export default CurrentWeather;

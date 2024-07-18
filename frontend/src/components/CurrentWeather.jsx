import React from "react";
import styles from "./styles/currentWeather.module.css";

const CurrentWeather = ({ currentWeather }) => {
  return (
    <div className={styles.currentWeather}>
      <div className={styles.temperature}>
        <span>{currentWeather.name}</span>
        <div className={styles.temp}>
          <span>{currentWeather.temperature}°</span>
          <img
            src={currentWeather.icon}
            alt="weather icon"
            className={styles.weatherIcon}
          />
        </div>
        <span>{currentWeather.feels_like}°</span>
        <span>{currentWeather.date}</span>
        <span>{currentWeather.time}</span>
      </div>
      <div className={styles.weatherDetails}>
        <span>{currentWeather.precip}</span>
        <span>{currentWeather.description}</span>
      </div>
    </div>
  );
};

export default CurrentWeather;

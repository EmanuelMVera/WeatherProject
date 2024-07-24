import React from "react";
import styles from "./styles/currentWeather.module.css";

const CurrentWeather = ({ currentWeather }) => {
  return (
    <div className={styles.currentWeather}>
      <h2>{currentWeather.name}</h2>
      <div className={styles.temp}>
        <span>{currentWeather.temperature}°</span>
        <img
          src={currentWeather.icon}
          alt="weather icon"
          className={styles.weatherIcon}
        />
      </div>
      <p>{currentWeather.description}</p>
    </div>
  );
};

export default CurrentWeather;

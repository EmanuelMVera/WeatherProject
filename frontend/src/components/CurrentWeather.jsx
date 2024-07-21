import React from "react";
import styles from "./styles/currentWeather.module.css";

const CurrentWeather = ({ currentWeather }) => {
  return (
    <div className={styles.currentWeather}>
      <span>{currentWeather.name}</span>
      <span>{currentWeather.date}</span>
      <div className={styles.temp}>
        <span>{currentWeather.temperature}°</span>
        <img
          src={currentWeather.icon}
          alt="weather icon"
          className={styles.weatherIcon}
        />
      </div>
      <span>{currentWeather.description}</span>
    </div>
  );
};

export default CurrentWeather;

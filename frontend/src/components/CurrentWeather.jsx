import React from "react";
import styles from "./styles/currentWeather.module.css";

const CurrentWeather = ({ currentWeather }) => {
  const { city, temperature } = currentWeather;
  const { current, description, icon } = temperature;

  return (
    <div className={styles.currentWeather}>
      <h2>{city}</h2>
      <div className={styles.temp}>
        <span>{current}°</span>
        <img
          src={`https://openweathermap.org/img/wn/${icon}.png`}
          alt="weather icon"
          className={styles.weatherIcon}
        />
      </div>
      <p>{description}</p>
    </div>
  );
};

export default CurrentWeather;

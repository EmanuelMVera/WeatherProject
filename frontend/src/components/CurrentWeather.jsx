import React from "react";
import styles from "./styles/currentWeather.module.css";

const CurrentWeather = ({ currentWeather }) => {
  const { city, temperature, date } = currentWeather;
  const { current, description } = temperature;

  return (
    // <div className={styles.currentWeather}>
    <div>
      <h2>{city}</h2>
      <h3>{date}</h3>
      {/* <div className={styles.temp}> */}
      <div>
        <span>{current}°</span>
      </div>
      <h3>{description}</h3>
    </div>
  );
};

export default CurrentWeather;

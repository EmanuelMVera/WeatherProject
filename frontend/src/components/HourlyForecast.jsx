import React from "react";
import styles from "./styles/hourlyForecast.module.css";

const HourlyForecast = ({ hourlyForecast }) => (
  <div className={styles.hourlyForecast}>
    {hourlyForecast.map(({ time, icon, temp_c }, index) => (
      <div className={styles.hour} key={index}>
        <span>{time}</span>
        <img src={icon} alt="weather icon" className={styles.weatherIcon} />
        <span>{temp_c}°</span>
      </div>
    ))}
  </div>
);

export default HourlyForecast;

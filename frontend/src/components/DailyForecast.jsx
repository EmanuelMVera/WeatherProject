import React from "react";
import styles from "./styles/dailyForecast.module.css";

const DailyForecast = ({ dailyForecast }) => {
  return (
    <div className={styles.dailyForecast}>
      <h3>Pronóstico por día</h3>
      {dailyForecast.map((daily, index) => (
        <div className={styles.day} key={index}>
          <img
            src={daily.icon}
            alt="weather icon"
            className={styles.weatherIcon}
          />
          <span className={styles.dayText}>{daily.fullDay}</span>
          <span className={styles.condition}>{daily.condition}</span>
          <span className={styles.temperature}>
            {daily.maxTemp}°/{daily.minTemp}°
          </span>
        </div>
      ))}
    </div>
  );
};

export default DailyForecast;

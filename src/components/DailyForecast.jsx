import React from "react";
import styles from "./styles/dailyForecast.module.css";

const DailyForecast = ({ dailyForecast }) => {
  return (
    <div className={styles.dailyForecast}>
      {dailyForecast.map((daily, index) => (
        <div className={styles.day} key={index}>
          <span>{daily.fullDay}</span>
          <img
            src={daily.icon}
            alt="weather icon"
            className={styles.weatherIcon}
          />
          <span>
            {daily.maxTemp}°/{daily.minTemp}°
          </span>
        </div>
      ))}
    </div>
  );
};

export default DailyForecast;

import React from "react";
import styles from "./styles/dailyForecast.module.css";

const DailyForecast = ({ dailyForecast }) => (
  <div className={styles.dailyForecast}>
    <h3>Pronóstico por día</h3>
    {dailyForecast.map(({ icon, day, condition, tempMin, tempMax }, index) => (
      <div className={styles.day} key={index}>
        <img
          src={`https://openweathermap.org/img/wn/${icon}.png`}
          alt="daily icon"
          className={styles.weatherIcon}
        />
        <span className={styles.dayText}>{day}</span>
        <span className={styles.condition}>{condition}</span>
        <span className={styles.temperature}>
          {tempMin}°/{tempMax}°
        </span>
      </div>
    ))}
  </div>
);

export default DailyForecast;

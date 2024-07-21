import React from "react";
import styles from "./styles/hourlyForecast.module.css";

const HourlyForecast = ({ hourlyForecast }) => {
  console.log(hourlyForecast);
  return (
    <div className={styles.hourlyForecast}>
      {hourlyForecast.map((hour, index) => (
        <div className={styles.hour} key={index}>
          <span>{hour.time}</span>
          <img
            src={hour.icon}
            alt="weather icon"
            className={styles.weatherIcon}
          />
          <span>{hour.temp_c}°</span>
        </div>
      ))}
    </div>
  );
};

export default HourlyForecast;

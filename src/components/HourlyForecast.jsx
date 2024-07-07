import React from "react";
// import styles from "./HourlyForecast.module.css";

const HourlyForecast = () => {
  return (
    <div className={styles.hourlyForecast}>
      <div className={styles.hour}>
        <span>Now</span>
        <img src="icon.png" alt="weather icon" className={styles.weatherIcon} />
        <span>4°</span>
      </div>
      {/* Repetir para cada hora */}
    </div>
  );
};

export default HourlyForecast;

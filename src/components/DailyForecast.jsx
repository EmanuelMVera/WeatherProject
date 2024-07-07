import React from "react";
// import styles from "./DailyForecast.module.css";

const DailyForecast = () => {
  return (
    <div className={styles.dailyForecast}>
      <div className={styles.day}>
        <span>Sat</span>
        <img src="icon.png" alt="weather icon" className={styles.weatherIcon} />
        <span>10°/4°</span>
      </div>
      {/* Repetir para cada día */}
    </div>
  );
};

export default DailyForecast;

import React from "react";
import styles from "./styles/sidebar.module.css";
import HourlyItem from "./HourlyItem";

const Sidebar = ({
  greeting,
  time,
  currentTemp,
  feelsLike,
  currentCondition,
  hourlyForecast,
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.greeting}>{greeting}</div>
      <div className={styles.time}>{time}</div>
      <div className={styles.currentWeather}>
        <div className={styles.currentTemp}>{currentTemp}°C</div>
        <div className={styles.feelsLike}>Feels like {feelsLike}°C</div>
        <div className={styles.currentCondition}>{currentCondition}</div>
      </div>
      <div className={styles.hourlyForecast}>
        {hourlyForecast.map((item, index) => (
          <HourlyItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

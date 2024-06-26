import React from "react";
import styles from "./styles/main.module.css";

const Main = ({ temperature, description, windSpeed, humidity }) => {
  return (
    <div className={styles.main}>
      <div className={styles.temperature}>{temperature}°C</div>
      <div className={styles.description}>{description}</div>
      <div className={styles.details}>
        <div className={styles.detailItem}>Wind: {windSpeed} m/s</div>
        <div className={styles.detailItem}>Humidity: {humidity}%</div>
      </div>
    </div>
  );
};

export default Main;

import React from "react";
import styles from "./styles/weatherMain.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWind, faDroplet } from "@fortawesome/free-solid-svg-icons";

const WeatherMain = ({ temperature, description, windSpeed, humidity }) => {
  return (
    <div className={styles.weatherMain}>
      <div className={styles.temperature}>{temperature}°</div>
      <div className={styles.description}>{description}</div>
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <FontAwesomeIcon icon={faWind} />
          {windSpeed} m/s
        </div>
        <div className={styles.detailItem}>
          <FontAwesomeIcon icon={faDroplet} />
          {humidity}%
        </div>
      </div>
    </div>
  );
};

export default WeatherMain;

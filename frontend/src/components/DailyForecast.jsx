import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles/dailyForecast.module.css";

const DailyForecast = ({ dailyForecast }) => (
  <div className={styles.dailyForecast}>
    {dailyForecast.map(({ icon, day, condition, tempMin, tempMax }, index) => (
      <div className={styles.day} key={index}>
        <span className={styles.dayText}>{day}</span>
        <img
          src={`https://openweathermap.org/img/wn/${icon}.png`}
          alt="daily icon"
          className={styles.weatherIcon}
        />
        <span className={styles.temperature}>
          <FontAwesomeIcon icon={faArrowDown} style={{ color: "blue" }} />
          {tempMin}°{" "}
          <FontAwesomeIcon icon={faArrowUp} style={{ color: "red" }} />
          {tempMax}°
        </span>
      </div>
    ))}
  </div>
);

export default DailyForecast;

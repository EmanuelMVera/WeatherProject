import React from "react";
import styles from "./styles/forecast.module.css";

const Forecast = ({ forecast }) => {
  return (
    <div className={styles.forecast}>
      {forecast.map((item, index) => (
        <div key={index} className={styles.forecastItem}>
          <div>{item.day}</div>
          <div>{item.temp}°C</div>
          <div>{item.condition}</div>
        </div>
      ))}
    </div>
  );
};

export default Forecast;

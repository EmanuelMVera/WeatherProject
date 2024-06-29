import React from "react";
import styles from "./styles/hourlyItem.module.css";
import WeatherIcon from "./WeatherIcon";

const HourlyItem = ({ time, temp, weather, icon }) => {
  return (
    <div className={styles.hourlyItem}>
      <WeatherIcon icon={icon} />
      <div>{time}</div>
      <div>{temp}</div>
      <div>{weather}</div>
    </div>
  );
};

export default HourlyItem;

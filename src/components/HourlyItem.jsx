import React from "react";
import styles from "./styles/hourlyItem.module.css";

const HourlyItem = ({ time, temp, weather, icon }) => {
  return (
    <div className={styles.hourlyItem}>
      <img src={icon} alt="" />
      <div>{time}</div>
      <div>{temp}</div>
      <div>{weather}</div>
    </div>
  );
};

export default HourlyItem;

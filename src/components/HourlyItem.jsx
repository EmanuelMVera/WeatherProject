import React from "react";
import styles from "./styles/hourlyItem.module.css";

const HourlyItem = ({ time, temp, condition }) => {
  return (
    <div className={styles.hourlyItem}>
      <div>{time}</div>
      <div>{temp}°C</div>
      <div>{condition}</div>
    </div>
  );
};

export default HourlyItem;

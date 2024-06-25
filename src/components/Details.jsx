import React from "react";
import styles from "./details.module.css";

const Details = ({ windSpeed, humidity }) => {
  return (
    <div className={styles.details}>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>{windSpeed} mph</span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>{humidity}%</span>
      </div>
    </div>
  );
};

export default Details;

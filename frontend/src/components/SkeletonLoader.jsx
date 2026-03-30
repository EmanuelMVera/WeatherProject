import React from "react";
import styles from "./SkeletonLoader.module.css";

/**
 * SkeletonLoader component for Suspense fallbacks
 * Provides fixed-height skeleton placeholders to minimize CLS
 * Types: 'hourly', 'daily', 'detail'
 */
const SkeletonLoader = ({ type = "detail" }) => {
  if (type === "hourly") {
    return (
      <div className={styles.skeletonBlock}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonHourlyContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonHourItem}>
              <div className={styles.skeletonLine} style={{ marginBottom: "0.4rem" }} />
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonLine} style={{ marginTop: "0.4rem" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "daily") {
    return (
      <div className={styles.skeletonBlock}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonDailyContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonDayItem}>
              <div className={styles.skeletonLine} style={{ width: "40%" }} />
              <div className={styles.skeletonIcon} style={{ width: "2rem", height: "2rem" }} />
              <div className={styles.skeletonLine} style={{ width: "50%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // type === 'detail'
  return (
    <div className={styles.skeletonBlock}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonDetailContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonDetailItem}>
            <div className={styles.skeletonIcon} style={{ width: "1.2rem", height: "1.2rem" }} />
            <div className={styles.skeletonLine} style={{ flex: 1 }} />
            <div className={styles.skeletonLine} style={{ width: "30%" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;

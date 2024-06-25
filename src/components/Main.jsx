import React from "react";
import Details from "./Details";
import styles from "./main.module.css";

const Main = ({ temperature, description, windSpeed, humidity }) => {
  return (
    <div className={styles.main}>
      <div className={styles.temperature}>{temperature}°</div>
      <div className={styles.description}>{description}</div>
      <Details windSpeed={windSpeed} humidity={humidity} />
    </div>
  );
};

export default Main;

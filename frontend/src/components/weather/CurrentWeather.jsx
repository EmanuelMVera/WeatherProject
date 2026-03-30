import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CurrentWeather.module.css";
import { weatherIconMap, weatherIconFallback } from "./weatherIconMap";

const CurrentWeather = ({ currentWeather }) => {
  const { city, country, temperature, date } = currentWeather;
  const { current, description, icon } = temperature;
  const weatherIcon = weatherIconMap[icon] || weatherIconFallback;

  return (
    <article className={styles.currentWeather}>
      <p className={styles.kicker}>Ahora</p>
      <h2 className={styles.city}>
        {city}, {country}
      </h2>
      <p className={styles.date}>{date}</p>
      <div className={styles.mainRow}>
        <div className={styles.weatherIconWrapper}>
          <FontAwesomeIcon
            icon={weatherIcon}
            className={styles.weatherIcon}
            aria-label={description}
          />
        </div>
        <p className={styles.temp}>{Math.round(current)}°</p>
      </div>
      <p className={styles.description}>{description}</p>
    </article>
  );
};

export default React.memo(CurrentWeather);

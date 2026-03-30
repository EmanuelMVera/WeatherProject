import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./DailyForecast.module.css";
import { weatherIconMap, weatherIconFallback } from "./weatherIconMap";

const DailyForecast = ({ dailyForecast }) => (
  <section className={styles.block}>
    <h3 className={styles.title}>Proximos dias</h3>
    <div className={styles.dailyForecast}>
      {dailyForecast.map(({ icon, day, tempMin, tempMax }) => {
        const dayIcon = weatherIconMap[icon] || weatherIconFallback;

        return (
          <article className={styles.day} key={`${day}-${tempMax}`}>
            <p className={styles.dayText}>{day}</p>
            <FontAwesomeIcon
              icon={dayIcon}
              className={styles.weatherIcon}
              aria-label={`Pronostico para ${day}`}
            />
            <p className={styles.temperature}>
              <span className={styles.min}>
                <FontAwesomeIcon icon={faArrowDown} /> {Math.round(tempMin)}°
              </span>
              <span className={styles.max}>
                <FontAwesomeIcon icon={faArrowUp} /> {Math.round(tempMax)}°
              </span>
            </p>
          </article>
        );
      })}
    </div>
  </section>
);

export default React.memo(DailyForecast);

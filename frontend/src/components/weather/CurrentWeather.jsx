import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CurrentWeather.module.css";
import { weatherIconMap, weatherIconFallback } from "./weatherIconMap";

const CurrentWeather = ({ currentWeather }) => {
  const cw = currentWeather ?? {};
  const { city, country, date } = cw;
  const { current, description, icon } = cw.temperature ?? {};
  const weatherIcon = weatherIconMap[icon] || weatherIconFallback;

  const temp = Number(current);
  const tempLabel = Number.isFinite(temp) ? `${Math.round(temp)}°` : "—";
  const place = [city, country].filter(Boolean).join(", ") || "Ubicación desconocida";

  return (
    <article className={styles.currentWeather}>
      <p className={styles.kicker}>Ahora</p>
      <h2 className={styles.city}>{place}</h2>
      <p className={styles.date}>{date || ""}</p>
      <div className={styles.mainRow}>
        <div className={styles.weatherIconWrapper}>
          <FontAwesomeIcon
            icon={weatherIcon}
            className={styles.weatherIcon}
            aria-label={description || "Estado del tiempo"}
          />
        </div>
        <p className={styles.temp}>{tempLabel}</p>
      </div>
      <p className={styles.description}>{description || ""}</p>
    </article>
  );
};

export default React.memo(CurrentWeather);

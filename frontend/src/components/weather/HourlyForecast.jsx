import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { weatherApiIconMap, weatherApiIconFallback } from "./weatherApiIconMap";
import styles from "./HourlyForecast.module.css";

const formatHourMinute = (time) => {
  if (typeof time !== "string") return "";

  const fromDate = new Date(time);
  if (!Number.isNaN(fromDate.valueOf())) {
    return fromDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  return time;
};

const HourlyForecast = ({ hourlyForecast }) => {
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const displayForecast = isMobile ? hourlyForecast.slice(0, 8) : hourlyForecast;

  return (
    <section className={styles.block}>
      <h3 className={styles.title}>Proximas horas</h3>
      <div className={styles.hourlyForecast}>
        {displayForecast.map(({ time, icon, temp_c }) => {
          const weatherIcon = weatherApiIconMap[icon] || weatherApiIconFallback;
          return (
            <article className={styles.hour} key={`${time}-${temp_c}`}>
              <p className={styles.time}>{formatHourMinute(time)}</p>
              <FontAwesomeIcon icon={weatherIcon} className={styles.weatherIcon} aria-label="Icono meteorologico" />
              <p className={styles.temp}>{Math.round(temp_c)}°</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(HourlyForecast);

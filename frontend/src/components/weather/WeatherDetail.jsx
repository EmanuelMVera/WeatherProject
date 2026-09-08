import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTemperatureHalf,
  faDroplet,
  faSun,
  faMoon,
  faWind,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./WeatherDetail.module.css";

const WeatherDetail = ({ currentWeather }) => {
  const cw = currentWeather ?? {};
  const { feelsLike } = cw.temperature ?? {};
  const { speed } = cw.wind ?? {};
  const { humidity, sunrise, sunset } = cw;

  const rows = useMemo(() => {
    const feels = Number(feelsLike);
    return [
      {
        icon: faTemperatureHalf,
        label: "Sensacion termica",
        value: Number.isFinite(feels) ? `${Math.round(feels)}°C` : "—",
      },
      {
        icon: faDroplet,
        label: "Humedad",
        value: humidity != null ? `${humidity}%` : "—",
      },
      { icon: faSun, label: "Amanecer", value: sunrise || "—" },
      { icon: faMoon, label: "Atardecer", value: sunset || "—" },
      {
        icon: faWind,
        label: "Viento",
        value: speed != null ? `${speed} km/h` : "—",
      },
    ];
  }, [feelsLike, humidity, sunrise, sunset, speed]);

  return (
    <section className={styles.block}>
      <h3 className={styles.title}>Detalles</h3>
      <div className={styles.weatherDetail}>
        {rows.map((item) => (
          <div className={styles.detailItem} key={item.label}>
            <span className={styles.icon}>
              <FontAwesomeIcon icon={item.icon} />
            </span>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(WeatherDetail);

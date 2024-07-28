import React from "react";
import styles from "./styles/weatherDetail.module.css";

const WeatherDetail = ({ currentWeather }) => {
  const {
    temperature: { feelsLike },
    humidity,
    sunrise,
    sunset,
    wind: { speed },
  } = currentWeather;

  return (
    <div className={styles.weatherDetail}>
      <h2>Detalles del Clima</h2>
      <p>
        <strong>Sensación térmica:</strong> {feelsLike}°C
      </p>
      <p>
        <strong>Humedad:</strong> {humidity}%
      </p>
      <p>
        <strong>Salida del sol:</strong> {sunrise}
      </p>
      <p>
        <strong>Puesta del sol:</strong> {sunset}
      </p>
      <p>
        <strong>Velocidad del viento:</strong> {speed} km/h
      </p>
    </div>
  );
};

export default WeatherDetail;

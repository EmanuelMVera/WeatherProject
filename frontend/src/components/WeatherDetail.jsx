import React from "react";
import styles from "./styles/weatherDetail.module.css";

const WeatherDetail = ({ currentWeather }) => {
  const { feels_like, humidity, precip_mm, uv, wind_speed } = currentWeather;

  return (
    <div className={styles.weatherDetail}>
      <h2>Detalles del Clima</h2>
      <p>
        <strong>Sensación térmica:</strong> {feels_like}°C
      </p>
      <p>
        <strong>Humedad:</strong> {humidity}%
      </p>
      <p>
        <strong>Precipitación:</strong> {precip_mm} mm
      </p>
      <p>
        <strong>Índice UV:</strong> {uv}
      </p>
      <p>
        <strong>Velocidad del viento:</strong> {wind_speed} km/h
      </p>
    </div>
  );
};

export default WeatherDetail;

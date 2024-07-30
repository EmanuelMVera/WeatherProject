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
      <p>
        <strong>Sensación térmica:</strong> {feelsLike}°C
      </p>
      <p>
        <strong>Humedad:</strong> {humidity}%
      </p>
      <p>
        <strong>Amanecer:</strong> {sunrise}AM
      </p>
      <p>
        <strong>Atardecer:</strong> {sunset}PM
      </p>
      <p>
        <strong>Velocidad del viento:</strong> {speed} km/h
      </p>
    </div>
  );
};

export default WeatherDetail;

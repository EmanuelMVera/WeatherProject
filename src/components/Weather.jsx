import React from "react";
import styles from "./styles/weatherDetail.module.css";
import CurrentWeather from "./CurrentWeather";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";

const Weather = ({ currentWeather, dailyForecast, hourlyForecast }) => {
  return (
    <div className={styles.weatherContainer}>
      <CurrentWeather />
      <div className={styles.forecast}>
        <HourlyForecast />
        <DailyForecast />
      </div>
    </div>
  );
};

export default Weather;

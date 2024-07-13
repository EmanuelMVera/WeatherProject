import React from "react";
import styles from "./styles/weather.module.css";
import CurrentWeather from "./CurrentWeather";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";

const Weather = ({ currentWeather, dailyForecast, hourlyForecast }) => {
  return (
    <div className={styles.weatherContainer}>
      <CurrentWeather currentWeather={currentWeather} />
      <div className={styles.forecast}>
        <HourlyForecast hourlyForecast={hourlyForecast} />
        <DailyForecast dailyForecast={dailyForecast} />
      </div>
    </div>
  );
};

export default Weather;

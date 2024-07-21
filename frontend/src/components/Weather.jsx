import React from "react";
import styles from "./styles/weather.module.css";
import CurrentWeather from "./CurrentWeather";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";

const Weather = ({ currentWeather, forecastWeather }) => {
  const { dailyForecast, hourlyForecast } = forecastWeather;
  return (
    <div className={styles.weatherContainer}>
      <CurrentWeather
        currentWeather={currentWeather}
        hourlyForecast={hourlyForecast}
      />
      <DailyForecast dailyForecast={dailyForecast} />
    </div>
  );
};

export default Weather;

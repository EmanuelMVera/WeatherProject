import React from "react";
import CurrentWeather from "./CurrentWeather";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";
import WeatherDetail from "./WeatherDetail";
import styles from "./styles/weatherInfo.module.css";

function WeatherInfo({ currentWeather, hourlyForecast, dailyForecast }) {
  return (
    <div className={styles.weatherInfoContainer}>
      <main>
        <CurrentWeather currentWeather={currentWeather} />
        <HourlyForecast hourlyForecast={hourlyForecast} />
      </main>
      <footer>
        <DailyForecast dailyForecast={dailyForecast} />
        <WeatherDetail currentWeather={currentWeather} />
      </footer>
    </div>
  );
}

export default WeatherInfo;

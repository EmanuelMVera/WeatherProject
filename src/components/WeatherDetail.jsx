import React from "react";
import styles from "./styles/weatherDetail.module.css";
import weatherData from "../utils/weatherData.json";
import Header from "./Header";
import Main from "./Main";
import Sidebar from "./Sidebar";
import Forecast from "./Forecast";

const WeatherDetail = ({ datos }) => {
  return (
    <div className={styles.weatherDetailContainer}>
      <Header location={weatherData.location} date={weatherData.date} />
      <Main
        temperature={weatherData.temperature}
        description={weatherData.description}
        windSpeed={weatherData.windSpeed}
        humidity={weatherData.humidity}
      />
      <Sidebar
        greeting={weatherData.greeting}
        time={weatherData.time}
        currentTemp={weatherData.currentTemp}
        feelsLike={weatherData.feelsLike}
        currentCondition={weatherData.currentCondition}
        hourlyForecast={weatherData.hourlyForecast}
      />
      <Forecast forecast={weatherData.forecast} />
    </div>
  );
};

export default WeatherDetail;

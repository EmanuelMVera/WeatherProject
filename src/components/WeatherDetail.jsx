import React from "react";
import styles from "./styles/weatherDetail.module.css";
import PropTypes from "prop-types";
import { getCurrentDateTime } from "../utils/getCurrentDateTime";
import Header from "./Header";
import WeatherMain from "./WeatherMain";
import Sidebar from "./Sidebar";
import DailyForecast from "./DailyForecast";

const WeatherDetail = ({ weatherData, dailyForecast, hourlyForecast }) => {
  const { fecha, hora } = getCurrentDateTime();
  return (
    <div className={styles.weatherDetailContainer}>
      <Header location={weatherData.name} date={fecha} />

      <div>
        <WeatherMain
          temperature={weatherData.temperature}
          description={weatherData.weather}
          windSpeed={weatherData.wind_speed}
          humidity={weatherData.humidity}
        />
        <DailyForecast forecastData={dailyForecast} />
      </div>

      <Sidebar
        greeting="Good Morning"
        time={hora}
        currentTemp={weatherData.temperature}
        feelsLike={weatherData.feels_like}
        currentCondition={weatherData.description}
        forecast={hourlyForecast}
      />
    </div>
  );
};

WeatherDetail.propTypes = {
  weatherData: PropTypes.object.isRequired,
  dailyForecast: PropTypes.array.isRequired,
  hourlyForecast: PropTypes.array.isRequired,
};

export default WeatherDetail;

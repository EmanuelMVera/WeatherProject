import React, { useState } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import WeatherDetail from "./components/WeatherDetail";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);

  const setDatos = (weather, daily, hourly) => {
    console.log("Weather Data:", weather);
    console.log("Daily Forecast Data:", daily);
    console.log("Hourly Forecast Data:", hourly);
    setCurrentWeather(weather);
    setDailyForecast(daily);
    setHourlyForecast(hourly);
  };

  return (
    <div className="app-container">
      <CitySearch setDatos={setDatos} />
      {/* {currentWeather && dailyForecast && hourlyForecast ? (
        <WeatherDetail
          weatherData={currentWeather}
          dailyForecast={dailyForecast}
          hourlyForecast={hourlyForecast}
        />
      ) : (
        <img src="../public/weather-icon.svg" alt="Weather icon" />
      )} */}
    </div>
  );
}

export default App;

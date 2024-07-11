import React, { useState } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import Weather from "./components/Weather";
import Navbar from "./components/NavBar";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);

  const setDatos = (weather, daily, hourly) => {
    setCurrentWeather(weather);
    setDailyForecast(daily);
    setHourlyForecast(hourly);
  };

  return (
    <div className="app-container">
      <Navbar setDatos={setDatos} currentWeather={currentWeather} />
      {/* <CitySearch setDatos={setDatos} /> */}
      {currentWeather && dailyForecast && hourlyForecast ? (
        <Weather
          currentWeather={currentWeather}
          dailyForecast={dailyForecast}
          hourlyForecast={hourlyForecast}
        />
      ) : (
        <img src="../public/weather-icon.svg" alt="Weather icon" />
      )}
    </div>
  );
}

export default App;

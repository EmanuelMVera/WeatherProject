import React, { useState, useEffect } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import Weather from "./components/Weather";
import Navbar from "./components/NavBar";
import fetchIPGeolocation from "./utils/ipGeolocation";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const setDatos = (weather, daily, hourly) => {
    setCurrentWeather(weather);
    setDailyForecast(daily);
    setHourlyForecast(hourly);
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const data = await fetchIPGeolocation();
        setLocation(data);
      } catch (error) {
        setError(error.message);
      }
    };

    getLocation();
  }, []);

  console.log(location);

  return (
    <div className="app-container">
      <Navbar
        setDatos={setDatos}
        currentWeather={currentWeather}
        location={location}
      />
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

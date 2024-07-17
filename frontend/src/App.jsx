import React, { useState, useEffect } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import Weather from "./components/Weather";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const setDatos = (current, daily, hourly) => {
    setCurrentWeather(current);
    setDailyForecast(daily);
    setHourlyForecast(hourly);
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const response = await fetch(`http://localhost:3001/ipGeolocation`);
        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }
        const data = await response.json();
        setLocation(data);
      } catch (error) {
        setError(error.message);
      }
    };

    getLocation();
  }, []);

  return (
    <div className="app-container">
      <CitySearch setDatos={setDatos} location={location} />
      {currentWeather && dailyForecast && hourlyForecast ? (
        <Weather
          currentWeather={currentWeather}
          dailyForecast={dailyForecast}
          hourlyForecast={hourlyForecast}
        />
      ) : (
        <p>cargando...</p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default App;

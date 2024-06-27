import React, { useState } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import WeatherDetail from "./components/WeatherDetail";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const setDatos = (weather, forecast) => {
    console.log("Weather Data:", weather);
    console.log("Forecast Data:", forecast);
    setWeatherData(weather);
    setForecastData(forecast);
  };

  return (
    <div className="app-container">
      <CitySearch setDatos={setDatos} />
      {weatherData != null ? (
        <WeatherDetail weatherData1={weatherData} forecastData={forecastData} />
      ) : (
        <h1>Cargando...</h1>
      )}
    </div>
  );
}

export default App;

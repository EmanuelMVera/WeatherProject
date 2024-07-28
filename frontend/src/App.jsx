import React, { useState, useEffect } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import WeatherInfo from "./components/WeatherInfo";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch("http://localhost:3001/ipGeolocation");
        if (!response.ok) throw new Error("Failed to fetch location data");

        const location = await response.json();
        fetchWeatherData(location?.cityName);
      } catch {
        setError("Error al obtener ubicación");
      }
    };

    fetchLocationData();
  }, []);

  const fetchWeatherData = async (city) => {
    if (!city) return;

    try {
      const responses = await Promise.all([
        fetch(`http://localhost:3001/currentWeather?city=${city}`),
        fetch(`http://localhost:3001/forecastWeather?city=${city}`),
      ]);

      if (responses.some((res) => !res.ok)) {
        throw new Error("Failed to fetch weather data");
      }

      const [currentWeatherData, forecastWeatherData] = await Promise.all(
        responses.map((res) => res.json())
      );

      setWeatherData({
        current: currentWeatherData,
        forecast: forecastWeatherData,
      });
      setError(null);
    } catch {
      setError("Error al obtener el pronóstico del clima");
    }
  };

  return (
    <div className="app-container">
      <CitySearch fetchWeatherData={fetchWeatherData} />
      {weatherData ? (
        <WeatherInfo
          currentWeather={weatherData.current}
          hourlyForecast={weatherData.forecast.hourlyForecast}
          dailyForecast={weatherData.forecast.dailyForecast}
        />
      ) : (
        <p>Cargando...</p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default App;

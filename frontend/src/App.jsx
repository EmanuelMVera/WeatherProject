import React, { useState, useEffect } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import WeatherInfo from "./components/WeatherInfo";

function App() {
  const [weatherData, setWeatherData] = useState({
    current: null,
    forecast: null,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch("http://localhost:3001/ipGeolocation");
        if (!response.ok) throw new Error("Failed to fetch location data");

        const location = await response.json();
        fetchWeatherData(location?.cityName);
      } catch (error) {
        setError("Error al obtener ubicación");
      }
    };

    fetchLocationData();
  }, []);

  const fetchWeatherData = async (city) => {
    if (!city) return;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`http://localhost:3001/currentWeather?city=${city}`),
        fetch(`http://localhost:3001/forecastWeather?city=${city}`),
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const currentWeatherData = await currentResponse.json();
      const forecastWeatherData = await forecastResponse.json();

      setWeatherData({
        current: currentWeatherData,
        forecast: forecastWeatherData,
      });
      setError(null);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Error al obtener el pronóstico del clima");
    }
  };

  return (
    <div className="app-container">
      <CitySearch onSearch={fetchWeatherData} />
      {weatherData.current && weatherData.forecast ? (
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

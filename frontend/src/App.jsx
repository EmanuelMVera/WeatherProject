import React, { useState, useEffect } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
// import CurrentWeather from "./components/CurrentWeather";
// import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";
import WeatherInfo from "./components/WeatherInfo";
import WeatherDetail from "./components/WeatherDetail";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastWeather, setForecastWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/ipGeolocation`);
        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }
        const location = await response.json();
        fetchWeatherData(location?.cityName);
      } catch (error) {
        setError(error.message);
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

      setCurrentWeather(currentWeatherData);
      setForecastWeather(forecastWeatherData);
      setError(null);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Error al obtener el pronóstico del clima");
    }
  };

  return (
    <div className="app-container">
      <header>
        <CitySearch fetchWeatherData={fetchWeatherData} />
      </header>
      <main>
        {currentWeather && forecastWeather ? (
          <>
            <WeatherInfo
              currentWeather={currentWeather}
              hourlyForecast={forecastWeather.hourlyForecast}
            />
            <DailyForecast dailyForecast={forecastWeather.dailyForecast} />
            <WeatherDetail />
          </>
        ) : (
          <p>Cargando...</p>
        )}
        {error && console.log(error)}
      </main>
    </div>
  );
}

export default App;

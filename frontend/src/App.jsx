import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import CurrentWeather from "./components/CurrentWeather";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";
import WeatherDetail from "./components/WeatherDetail";
import ErrorModal from "./components/ErrorModal";
import {
  getCurrentWeatherData,
  getForecastWeatherData,
  fetchWeatherData,
} from "./utils/weatherUtils";
const ipApiKey = import.meta.env.VITE_IP_API_KEY;

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const fetchLocationData = useCallback(async () => {
    try {
      const locationResponse = await fetchWeatherData(
        `https://ipinfo.io/json?token=${ipApiKey}`
      );
      fetchWeatherDataHandler(locationResponse.city);
    } catch {
      fetchWeatherDataHandler("Buenos Aires");
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const reverseGeolocationUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`;
          const reverseGeolocationResponse = await fetchWeatherData(
            reverseGeolocationUrl
          );
          fetchWeatherDataHandler(reverseGeolocationResponse.city);
        } catch {
          fetchLocationData();
        }
      }, fetchLocationData);
    } else {
      fetchLocationData();
    }
  }, [fetchLocationData]);

  const fetchWeatherDataHandler = async (city) => {
    if (!city) return;

    try {
      const [current, forecast] = await Promise.all([
        getCurrentWeatherData(city),
        getForecastWeatherData(city),
      ]);

      setWeatherData({ current, forecast });
      setError(null); // Limpiar errores previos
    } catch (error) {
      setError(error.message || "Error al obtener datos.");
      setShowErrorModal(true); // Mostrar el modal de error
    }
  };

  const handleCloseModal = () => {
    setShowErrorModal(false);
    setError(null);
  };

  return (
    <div className="app-container">
      <div className="block block1">
        <CitySearch fetchWeatherData={fetchWeatherDataHandler} />
      </div>
      {weatherData ? (
        <>
          {console.log(weatherData)}
          <div className="block block3">
            <CurrentWeather currentWeather={weatherData.current} />
          </div>

          <div className="block block2">
            <HourlyForecast
              hourlyForecast={weatherData.forecast.hourlyForecast}
            />
          </div>

          <div className="block block4">
            <DailyForecast dailyForecast={weatherData.forecast.dailyForecast} />
          </div>

          <div className="block block5">
            <WeatherDetail currentWeather={weatherData.current} />
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
      {showErrorModal && (
        <ErrorModal message={error} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;

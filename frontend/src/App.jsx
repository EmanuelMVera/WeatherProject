import React, { useState, useEffect } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import WeatherInfo from "./components/WeatherInfo";
import Modal from "./components/Modal";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch("http://localhost:3001/ipGeolocation");
        if (!response.ok) throw new Error("Failed to fetch location data");

        const location = await response.json();
        fetchWeatherData(location?.cityName);
      } catch {
        setError("Error al obtener ubicación");
        setShowErrorModal(true);
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
      setShowErrorModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowErrorModal(false);
    setError(null);
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
      <Modal show={showErrorModal} onClose={handleCloseModal}>
        <p>{error}</p>
      </Modal>
    </div>
  );
}

export default App;

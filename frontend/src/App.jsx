import React, { useState, useEffect } from "react";
const apiUrl = import.meta.env.VITE_API_URL;
import "./App.css";
import CitySearch from "./components/CitySearch";
import WeatherInfo from "./components/WeatherInfo";
import ErrorModal from "./components/ErrorModal";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  console.log("API URL:", apiUrl);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`${apiUrl}/ipGeolocation`);
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
      const urls = [
        `${apiUrl}/currentWeather?city=${city}`,
        `${apiUrl}/forecastWeather?city=${city}`,
      ];

      const responses = await Promise.all(urls.map((url) => fetch(url)));

      // version 1
      // if (responses.some((res) => !res.ok)) {
      //   throw new Error("Failed to fetch weather data");
      // }
      // version 2
      for (const response of responses) {
        if (!response.ok) {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Error al obtener datos");
        }
      }

      const [currentWeatherData, forecastWeatherData] = await Promise.all(
        responses.map((response) => response.json())
      );

      setWeatherData({
        current: currentWeatherData,
        forecast: forecastWeatherData,
      });
      setError(null);
    } catch (error) {
      error.message === "Ciudad no encontrada"
        ? setError(error.message)
        : setError("Error al obtener datos");
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
      <ErrorModal show={showErrorModal} onClose={handleCloseModal}>
        <p>{error}</p>
      </ErrorModal>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
// import WeatherInfo from "./components/WeatherInfo";
import CurrentWeather from "./components/CurrentWeather";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";
import WeatherDetail from "./components/WeatherDetail";
import ErrorModal from "./components/ErrorModal";

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
      const urls = [
        `http://localhost:3001/currentWeather?city=${city}`,
        `http://localhost:3001/forecastWeather?city=${city}`,
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
      <div className="block block1">
        <CitySearch fetchWeatherData={fetchWeatherData} />
      </div>

      {weatherData ? (
        <>
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
        <>
          <div className="block block2"></div>
          <div className="block block3"></div>
          <div className="block block4"></div>
          <div className="block block5"></div>
        </>
      )}
      <ErrorModal show={showErrorModal} onClose={handleCloseModal}>
        <p>{error}</p>
      </ErrorModal>
    </div>
  );
}

export default App;

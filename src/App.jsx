import React, { useState } from "react";
import "./App.css";
import weatherData from "./utils/weatherData.json";
import CitySearch from "./components/CitySearch";
import Header from "./components/Header";
import Main from "./components/Main";
import Sidebar from "./components/Sidebar";
import Forecast from "./components/Forecast";

function App() {
  const [datos, setDatos] = useState(null);
  console.log("Datos formateados: " + datos);

  return (
    <div className="app-container">
      <CitySearch setDatos={setDatos} />
      <div className="weather-app">
        <Header location={weatherData.location} date={weatherData.date} />
        <Main
          temperature={weatherData.temperature}
          description={weatherData.description}
          windSpeed={weatherData.windSpeed}
          humidity={weatherData.humidity}
        />
        <Sidebar
          greeting={weatherData.greeting}
          time={weatherData.time}
          currentTemp={weatherData.currentTemp}
          feelsLike={weatherData.feelsLike}
          currentCondition={weatherData.currentCondition}
          hourlyForecast={weatherData.hourlyForecast}
        />
        <Forecast forecast={weatherData.forecast} />
      </div>
    </div>
  );
}

export default App;

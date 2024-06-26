import React, { useState } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import Header from "./components/Header";
import Main from "./components/Main";
import Sidebar from "./components/Sidebar";

function App() {
  const [datos, setDatos] = useState(null);
  console.log("Datos formateados: " + datos);

  // Datos de prueba
  const location = "Multan";
  const date = "21.04.2021";
  const temperature = 20;
  const description = "Cloudy";
  const windSpeed = 6.1;
  const humidity = 90;
  const greeting = "Good Morning";
  const time = "12:27 PM";
  const currentTemp = 20;
  const feelsLike = 19;
  const currentCondition = "Cloudy";
  const hourlyForecast = [
    { time: "1 PM", temp: 20, condition: "Cloudy" },
    { time: "2 PM", temp: 21, condition: "Rainy" },
    { time: "3 PM", temp: 21, condition: "Rainy" },
    { time: "4 PM", temp: 20, condition: "Cloudy" },
    { time: "5 PM", temp: 21, condition: "Rainy" },
    { time: "6 PM", temp: 21, condition: "Rainy" },
  ];
  const forecast = [
    { day: "Tue", temp: 32, condition: "Sunny" },
    { day: "Wed", temp: 12, condition: "Rainy" },
    { day: "Thu", temp: 13, condition: "Rainy" },
    { day: "Fri", temp: 22, condition: "Mist" },
    { day: "Sat", temp: 22, condition: "Mist" },
  ];

  return (
    <div className="app-container">
      <CitySearch setDatos={setDatos} />
      <div className="weather-app">
        <Header location={location} date={date} />
        <Main
          temperature={temperature}
          description={description}
          windSpeed={windSpeed}
          humidity={humidity}
        />
        <Sidebar
          greeting={greeting}
          time={time}
          currentTemp={currentTemp}
          feelsLike={feelsLike}
          currentCondition={currentCondition}
          hourlyForecast={hourlyForecast}
        />
      </div>
    </div>
  );
}

export default App;

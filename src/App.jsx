import React, { useState } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import Header from "./components/Header";
import Main from "./components/Main";

function App() {
  const datosDefault = {
    name: "-",
    min: "-",
    max: "-",
    img: "-",
    description: "-",
    humidity: "-",
    id: "-",
    wind: "-",
    temp: "-",
    date: "-",
    hour: "-",
  };
  const [datos, setDatos] = useState(datosDefault);

  return (
    <>
      <CitySearch setDatos={setDatos} />
      <div className="weather-app">
        <Header location={datos.name} date={datos.date} />
        <Main
          temperature={datos.temp}
          description={datos.description}
          windSpeed={datos.wind}
          humidity={datos.humidity}
        />
      </div>
    </>
  );
}

export default App;

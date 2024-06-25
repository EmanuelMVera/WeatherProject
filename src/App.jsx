import React, { useState } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import Header from "./components/Header";

function App() {
  const datosDefault = {
    name: "-",
    min: "-",
    max: "-",
    img: "-",
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
      </div>
    </>
  );
}

export default App;

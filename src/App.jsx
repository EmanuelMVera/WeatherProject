import React, { useState } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";
import WeatherDetail from "./components/WeatherDetail";

function App() {
  const [datos, setDatos] = useState(null);
  console.log("Datos formateados: " + datos);

  return (
    <div className="app-container">
      <CitySearch setDatos={setDatos} />
      {datos != null ? <WeatherDetail datos={datos} /> : <h1>Cargando...</h1>}
    </div>
  );
}

export default App;

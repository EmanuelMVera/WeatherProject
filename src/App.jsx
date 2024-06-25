import React, { useState } from "react";
import "./App.css";
import CitySearch from "./components/CitySearch";

function App() {
  const [datos, setDatos] = useState(null);

  return (
    <>
      <CitySearch setDatos={setDatos} />
      {console.log(datos)}
    </>
  );
}

export default App;

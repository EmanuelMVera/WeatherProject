import React, { useState } from "react";
import "./styles/DropdownMenu.css";
import CitySearch from "./CitySearch";

const DropdownMenu = ({ fetchWeatherData }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Función para manejar el click de la flecha
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown-container">
      <div className="search-bar">
        <CitySearch fetchWeatherData={fetchWeatherData} />
        <button onClick={toggleDropdown} className="dropdown-toggle">
          {/* Puedes usar un ícono de flecha o un carácter unicode */}
          {isOpen ? "▲" : "▼"}
        </button>
      </div>

      {/* Contenedor desplegable */}
      {isOpen && (
        <div className="dropdown-content">
          <div className="card">Card 1</div>
          <div className="card">Card 2</div>
          <div className="card">Card 3</div>
          <div className="card">Card 4</div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;

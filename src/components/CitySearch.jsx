import React, { useState } from "react";
import { fetchWeatherData } from "../utils/fetchApi.js";
import styles from "./citySearch.module.css";

const CitySearch = ({ setDatos }) => {
  const [city, setCity] = useState("");

  const buscarCiudad = async (ciudad) => {
    try {
      const recurso = await fetchWeatherData(ciudad);
      if (recurso.main) {
        const ciudad = {
          name: recurso.name,
          min: Math.round(recurso.main.temp_min),
          max: Math.round(recurso.main.temp_max),
          img: recurso.weather[0].icon,
          id: recurso.id,
          wind: recurso.wind.speed,
          temp: recurso.main.temp,
        };
        setDatos(ciudad);
      } else {
        console.log("Ciudad no encontrada");
      }
    } catch (error) {
      console.error("Error fetching city data:", error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    buscarCiudad(city);
  };

  const handleInputChange = (event) => {
    setCity(event.target.value);
  };

  return (
    <div className={styles.search}>
      <h1>Buscador</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          name="name"
          placeholder="Enter city name"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Buscar Ciudad
        </button>
      </form>
    </div>
  );
};

export default CitySearch;

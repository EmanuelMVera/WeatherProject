import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { fetchWeatherData } from "../utils/fetchApi.js";
import styles from "./citySearch.module.css";

/**
 * Componente CitySearch que permite buscar el clima de una ciudad.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {Function} props.setDatos - Función para establecer los datos del clima de la ciudad.
 */
const CitySearch = ({ setDatos }) => {
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);

  /**
   * Busca el clima de una ciudad y establece los datos en el estado.
   *
   * @param {string} ciudad - El nombre de la ciudad a buscar.
   */
  const buscarCiudad = async (ciudad) => {
    try {
      const recurso = await fetchWeatherData(ciudad);
      if (recurso.main) {
        const ciudadData = {
          name: recurso.name,
          min: Math.round(recurso.main.temp_min),
          max: Math.round(recurso.main.temp_max),
          img: recurso.weather[0].icon,
          id: recurso.id,
          wind: recurso.wind.speed,
          temp: recurso.main.temp,
        };
        setDatos(ciudadData);
        setError(null); // Limpiar cualquier error previo
      } else {
        setError("Ciudad no encontrada");
      }
    } catch (error) {
      console.error("Error fetching city data:", error);
      setError("Error fetching city data");
    }
  };

  /**
   * Manejador para el evento de envío del formulario.
   *
   * @param {Event} event - El evento del formulario.
   */
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      buscarCiudad(city);
      setCity(""); // Limpiar el campo de entrada después de enviar
    },
    [city]
  );

  /**
   * Manejador para el cambio en el campo de entrada de la ciudad.
   *
   * @param {Event} event - El evento de cambio del campo de entrada.
   */
  const handleInputChange = useCallback((event) => {
    setCity(event.target.value);
  }, []);

  return (
    <div className={styles.search}>
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
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

CitySearch.propTypes = {
  setDatos: PropTypes.func.isRequired,
};

export default CitySearch;

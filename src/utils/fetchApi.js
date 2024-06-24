// Importar la clave API desde las variables de entorno
const API_KEY = process.env.REACT_APP_API_KEY;

// Definir la URL base de la API de OpenWeatherMap
const BASE_URL = "https://api.openweathermap.org/data/3.0/weather";

// Función para construir la URL completa con los parámetros necesarios
const buildUrl = (city) =>
  `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

/**
 * Función para obtener los datos meteorológicos de una ciudad específica
 * @param {string} city - Nombre de la ciudad para la cual se obtendrán los datos meteorológicos
 * @returns {Promise<Object>} - Una promesa que se resuelve con los datos meteorológicos en formato JSON
 * @throws {Error} - Lanza un error si la solicitud falla o si se agota el tiempo de espera
 */
export const fetchWeatherData = async (city) => {
  // Crear un AbortController para manejar el tiempo de espera
  const controller = new AbortController();
  // Configurar un temporizador para abortar la solicitud después de 10 segundos
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de tiempo de espera

  try {
    // Realizar la solicitud fetch y pasar la señal de aborto
    const response = await fetch(buildUrl(city), {
      signal: controller.signal,
    });

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found");
      } else if (response.status === 401) {
        throw new Error("Invalid API key");
      } else if (response.status === 500) {
        throw new Error("Server error. Please try again later");
      } else {
        throw new Error("Failed to fetch weather data");
      }
    }

    // Parsear la respuesta JSON
    const data = await response.json();
    return data;
  } catch (error) {
    // Verificar si el error es debido a un aborto
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    } else {
      throw error;
    }
  } finally {
    // Limpiar el temporizador
    clearTimeout(timeoutId);
  }
};

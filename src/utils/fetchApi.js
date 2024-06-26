// Importa la clave API desde las variables de entorno cargadas por dotenv
const apiKey = import.meta.env.VITE_API_KEY;

/**
 * Fetches weather data for a given city.
 * @param {string} city - The name of the city to fetch weather data for.
 * @returns {Promise<Object>} A promise that resolves to the weather data for the specified city.
 * @throws Will throw an error if the fetch request fails or the response is not ok.
 */
export const fetchWeatherData = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error fetching weather data: ${errorData.message} (status: ${response.status})`
      );
    }

    const data = await response.json();
    console.log("Datos Puros de la Api Externa: " + data);
    return data;
  } catch (error) {
    if (error.name === "TypeError") {
      console.error("Network error or resource not found:", error);
    } else {
      console.error("Failed to fetch weather data:", error);
    }
    throw error; // re-throw the error after logging it
  }
};

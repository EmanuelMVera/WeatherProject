import { parseErrorBody, fetchWithTimeout } from "../utils/http.js";

/**
 * @param {string} apiUrl
 * @param {string} city
 */
export async function fetchWeatherBundle(apiUrl, city) {
  const q = encodeURIComponent(city);
  const urls = [
    `${apiUrl}/currentWeather?city=${q}`,
    `${apiUrl}/forecastWeather?city=${q}`,
  ];

  try {
    const responses = await Promise.all(
      urls.map((url) => fetchWithTimeout(url, 10000))
    );

    for (const response of responses) {
      if (!response.ok) {
        const message = await parseErrorBody(response);
        // Handle specific status codes
        if (response.status === 429) {
          throw new Error(
            "Demasiadas solicitudes. Por favor, espera un momento antes de reintentar."
          );
        } else if (response.status === 404) {
          throw new Error("Ciudad no encontrada");
        }
        throw new Error(message);
      }
    }

    const [currentWeatherData, forecastWeatherData] = await Promise.all(
      responses.map((response) => response.json())
    );

    return {
      current: currentWeatherData,
      forecast: forecastWeatherData,
    };
  } catch (err) {
    // Re-throw with context
    if (err.message.includes("Timeout")) {
      throw new Error(
        "La solicitud tardó demasiado. Por favor, verifica tu conexión."
      );
    }
    throw err;
  }
}

/**
 * @param {string} apiUrl
 * @returns {Promise<string|undefined>}
 */
export async function fetchCityFromIp(apiUrl) {
  try {
    const response = await fetchWithTimeout(`${apiUrl}/ipGeolocation`, 10000);
    if (!response.ok) {
      const message = await parseErrorBody(response);
      if (response.status === 429) {
        throw new Error(
          "Demasiadas solicitudes de ubicación. Usando ubicación predeterminada."
        );
      }
      throw new Error(message || "Error al obtener ubicación");
    }
    const location = await response.json();
    return location?.cityName;
  } catch (err) {
    if (err.message.includes("Timeout")) {
      throw new Error(
        "Timeout al obtener ubicación. Usando ubicación predeterminada."
      );
    }
    throw err;
  }
}

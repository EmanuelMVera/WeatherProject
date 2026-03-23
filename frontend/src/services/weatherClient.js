async function parseErrorBody(response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data.error || "Error al obtener datos";
  } catch {
    return text || "Error al obtener datos";
  }
}

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

  const responses = await Promise.all(urls.map((url) => fetch(url)));

  for (const response of responses) {
    if (!response.ok) {
      const message = await parseErrorBody(response);
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
}

/**
 * @param {string} apiUrl
 * @returns {Promise<string|undefined>}
 */
export async function fetchCityFromIp(apiUrl) {
  const response = await fetch(`${apiUrl}/ipGeolocation`);
  if (!response.ok) {
    const message = await parseErrorBody(response);
    throw new Error(message || "Error al obtener ubicación");
  }
  const location = await response.json();
  return location?.cityName;
}

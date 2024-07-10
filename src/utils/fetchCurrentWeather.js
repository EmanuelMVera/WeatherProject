const apiKey = import.meta.env.VITE_API_KEY;

export const fetchCurrentWeather = async (city) => {
  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=es&current_fields=temp_c,condition:text,icon`
    );

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(
        `Error fetching weather data: ${message} (status: ${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      error.name === "TypeError"
        ? "Network error or resource not found:"
        : "Failed to fetch weather data:",
      error
    );
    throw error;
  }
};

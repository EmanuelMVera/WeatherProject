const apiKey = import.meta.env.VITE_API_KEY;

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

    const weatherData = {
      name: data.name,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      wind_speed: data.wind.speed,
      humidity: data.main.humidity,
      date: new Date(data.dt * 1000).toLocaleDateString(),
      time: new Date(data.dt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      weather: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };

    return weatherData;
  } catch (error) {
    if (error.name === "TypeError") {
      console.error("Network error or resource not found:", error);
    } else {
      console.error("Failed to fetch weather data:", error);
    }
    throw error;
  }
};

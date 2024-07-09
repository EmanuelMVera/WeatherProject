const apiKey = import.meta.env.VITE_API_KEY;

export const fetchCurrentWeather = async (city) => {
  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&current_fields=temp_c,condition:text,icon`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error fetching weather data: ${errorData.message} (status: ${response.status})`
      );
    }

    const data = await response.json();
    return data;

    // return {
    //   name: data.name,
    //   temperature: data.main.temp,
    //   minTemp: data.main.temp_min,
    //   maxTemp: data.main.temp_max,
    //   feels_like: data.main.feels_like,
    //   wind_speed: data.wind.speed,
    //   humidity: data.main.humidity,
    //   date: new Date(data.dt * 1000).toLocaleDateString(),
    //   time: new Date(data.dt * 1000).toLocaleTimeString([], {
    //     hour: "2-digit",
    //     minute: "2-digit",
    //   }),
    //   weather: data.weather[0].main,
    //   description: data.weather[0].description,
    //   icon: data.weather[0].icon,
    //   pressure: data.main.pressure,
    // };
  } catch (error) {
    if (error.name === "TypeError") {
      console.error("Network error or resource not found:", error);
    } else {
      console.error("Failed to fetch weather data:", error);
    }
    throw error;
  }
};

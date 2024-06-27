const apiKey = import.meta.env.VITE_API_KEY;

export const fetchForecastData = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&cnt=5&units=metric&lang=es`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error fetching weather data: ${errorData.message} (status: ${response.status})`
      );
    }

    const data = await response.json();

    const hourlyForecast = data.list.map((item) => ({
      time: item.dt_txt.split(" ")[1].slice(0, 5),
      weather: item.weather[0].main,
      icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
      description: item.main.temp + "C°",
    }));

    return hourlyForecast;
  } catch (error) {
    if (error.name === "TypeError") {
      console.error("Network error or resource not found:", error);
    } else {
      console.error("Failed to fetch weather data:", error);
    }
    throw error;
  }
};

const apiKey = import.meta.env.VITE_API_KEY;

export const fetchForecastData = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error fetching weather data: ${errorData.message} (status: ${response.status})`
      );
    }

    const data = await response.json();
    const now = new Date();

    // Transforming data for daily forecast
    const dailyForecast = data.list.reduce((acc, item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!acc[date]) {
        acc[date] = {
          date: date,
          avgTemp: item.main.temp,
          weather: item.weather[0].description,
          count: 1,
        };
      } else {
        acc[date].avgTemp += item.main.temp;
        acc[date].count += 1;
      }
      return acc;
    }, {});

    const dailyForecastArray = Object.values(dailyForecast).map((day) => ({
      date: day.date,
      avgTemp: (day.avgTemp / day.count).toFixed(1),
      weather: day.weather,
    }));

    // Transforming data for hourly forecast
    const hourlyForecast = data.list
      .filter((item) => new Date(item.dt_txt) > now)
      .slice(0, 6)
      .map((item) => ({
        time: item.dt_txt.split(" ")[1].slice(0, 5),
        weather: item.weather[0].main,
        icon: item.weather[0].icon,
        temp: item.main.temp + "°C",
      }));

    return { dailyForecast: dailyForecastArray, hourlyForecast };
  } catch (error) {
    if (error.name === "TypeError") {
      console.error("Network error or resource not found:", error);
    } else {
      console.error("Failed to fetch weather data:", error);
    }
    throw error;
  }
};

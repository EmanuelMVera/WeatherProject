const apiKey = import.meta.env.VITE_API_KEY;

export const fetchHourlyForecast = async (city) => {
  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=2&hour_fields=time,temp_c`
    );

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(
        `Error fetching weather data: ${message} (status: ${response.status})`
      );
    }

    const data = await response.json();
    const currentTime = new Date();
    const tomorrowTime = new Date(currentTime);
    tomorrowTime.setDate(currentTime.getDate() + 1);

    const next24HoursWeather = data.forecast.forecastday
      .flatMap((day) => day.hour)
      .filter((hour) => {
        const hourTime = new Date(hour.time);
        return hourTime >= currentTime && hourTime < tomorrowTime;
      })
      .map((hour) => ({
        time: hour.time.slice(11, 13),
        temp_c: hour.temp_c,
        conditionText: hour.condition.text,
        icon: hour.condition.icon,
      }));

    return next24HoursWeather;
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

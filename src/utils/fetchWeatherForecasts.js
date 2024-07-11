const apiKey = import.meta.env.VITE_API_KEY;

const fetchWeatherData = async (city) => {
  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&lang=es&days=14&hour_fields=time,temp_c`
    );

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(
        `Error fetching weather data: ${message} (status: ${response.status})`
      );
    }

    const data = await response.json();
    return data;
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

export const fetchWeatherForecasts = async (city) => {
  try {
    const data = await fetchWeatherData(city);

    // Process hourly forecast
    const currentTime = new Date();
    const tomorrowTime = new Date(currentTime);
    tomorrowTime.setDate(currentTime.getDate() + 1);

    const hourlyForecast = data.forecast.forecastday
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

    // Process daily forecast
    const daysOfWeek = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const shortDaysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const dailyForecast = data.forecast.forecastday.map((day) => {
      const date = new Date(day.date);
      return {
        icon: day.day.condition.icon,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        fullDay: daysOfWeek[date.getDay()],
        shortDay: shortDaysOfWeek[date.getDay()],
      };
    });

    return { hourlyForecast, dailyForecast };
  } catch (error) {
    throw error;
  }
};

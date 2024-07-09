const apiKey = import.meta.env.VITE_API_KEY;

export const fetchHourlyForecast = async (city) => {
  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=2&hour_fields=time,temp_c`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error fetching weather data: ${errorData.message} (status: ${response.status})`
      );
    }

    const data = await response.json();

    // Aquí accedes a los datos de current, forecast y location
    const currentWeather = data.current; // Datos del clima actual
    const forecast = data.forecast; // Datos del pronóstico
    const location = data.location; // Datos de la ubicación

    // Obtener la hora actual
    const currentTime = new Date();

    // Calcular la hora de mañana a la misma hora actual pero en el día siguiente
    const tomorrowTime = new Date(currentTime);
    tomorrowTime.setDate(currentTime.getDate() + 1);

    // Filtrar y mapear los datos del clima para las próximas 24 horas
    const next24HoursWeather = forecast.forecastday
      .flatMap((day) => day.hour)
      .filter((hour) => {
        const hourTime = new Date(hour.time);
        // Incluir la hora actual y las próximas 23 horas
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
    if (error.name === "TypeError") {
      console.error("Network error or resource not found:", error);
    } else {
      console.error("Failed to fetch weather data:", error);
    }
    throw error;
  }
};

const apiKey = import.meta.env.VITE_API_KEY;

export const fetchDailyForecast = async (city) => {
  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=14`
    );

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(
        `Error fetching weather data: ${message} (status: ${response.status})`
      );
    }

    const data = await response.json();

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

    const daily = data.forecast.forecastday.map((day) => {
      const date = new Date(day.date);
      return {
        icon: day.day.condition.icon,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        fullDay: daysOfWeek[date.getDay()],
        shortDay: shortDaysOfWeek[date.getDay()],
      };
    });

    return daily;
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

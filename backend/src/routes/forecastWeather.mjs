const forecastWeather = async (req, res) => {
  const { city } = req.query;

  try {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${city}&lang=es&days=14`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error obteniendo la ubicación");
    }

    const data = await response.json();

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const hourlyForecast = data.forecast.forecastday
      .flatMap((day) => day.hour)
      .filter((hour) => {
        const hourTime = new Date(hour.time);
        return hourTime >= today && hourTime < tomorrow;
      })
      .map((hour) => ({
        time: hour.time.slice(11, 13),
        temp_c: hour.temp_c,
        conditionText: hour.condition.text,
        icon: hour.condition.icon,
      }));

    const dailyForecast = data.forecast.forecastday.map((day) => {
      const date = new Date(day.date);
      return {
        icon: day.day.condition.icon,
        condition: day.day.condition.text,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        fullDay: [
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado",
        ][date.getDay()],
        shortDay: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][
          date.getDay()
        ],
      };
    });

    const forecast = { hourlyForecast, dailyForecast };
    res.json(forecast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el pronóstico del clima" });
  }
};

export default forecastWeather;

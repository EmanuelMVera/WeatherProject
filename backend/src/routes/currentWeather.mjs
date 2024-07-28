const currentWeather = async (req, res) => {
  const { city } = req.query;

  const formatTimestamp = (unixTimestamp, timezoneOffset) => {
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    return {
      date: date.toLocaleDateString("es-AR"),
      time: date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&lang=es&units=metric`;
    const response = await fetch(url);

    if (!response.ok) throw new Error("Error obteniendo la ubicación");

    const data = await response.json();

    const { main, weather, wind, clouds, sys, visibility, timezone, dt, name } =
      data;

    const formattedDate = formatTimestamp(dt, timezone);
    const formattedSunrise = formatTimestamp(sys.sunrise, 0);
    const formattedSunset = formatTimestamp(sys.sunset, 0);

    const currentWeather = {
      temperature: {
        current: main.temp,
        feelsLike: main.feels_like,
        min: main.temp_min,
        max: main.temp_max,
        description: weather[0].description,
        icon: weather[0].icon,
      },
      pressure: main.pressure,
      humidity: main.humidity,
      visibility,
      wind: {
        speed: wind.speed,
        direction: wind.deg,
        gust: wind.gust || 0,
      },
      clouds: clouds.all,
      city: name,
      country: sys.country,
      date: formattedDate.date,
      time: formattedDate.time,
      sunrise: formattedSunrise.time,
      sunset: formattedSunset.time,
    };

    res.json(currentWeather);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el pronóstico del clima" });
  }
};

export default currentWeather;

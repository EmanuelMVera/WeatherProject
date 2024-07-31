import { format } from "date-fns";
import { es } from "date-fns/locale";

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

const formatFullDate = (unixTimestamp, timezoneOffset) => {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  let formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: es });

  // Capitalize the first letter of the day and month
  return formattedDate.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
};

const fetchWeatherData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error obteniendo la ubicación");
  return response.json();
};

const currentWeather = async (req, res) => {
  const { city } = req.query;

  try {
    const urlOpenWeather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&lang=es&units=metric`;
    const urlWeatherAPI = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}&lang=es`;

    const [dataOpenWeather, dataWeatherAPI] = await Promise.all([
      fetchWeatherData(urlOpenWeather),
      fetchWeatherData(urlWeatherAPI),
    ]);

    const { main, weather, wind, clouds, sys, visibility, timezone, dt, name } =
      dataOpenWeather;

    const formattedDate = formatFullDate(dt, timezone);
    const formattedSunrise = formatTimestamp(sys.sunrise, timezone).time;
    const formattedSunset = formatTimestamp(sys.sunset, timezone).time;

    const currentWeatherData = {
      temperature: {
        current: main.temp,
        feelsLike: main.feels_like,
        min: main.temp_min,
        max: main.temp_max,
        description: dataWeatherAPI.current.condition.text,
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
      date: formattedDate,
      time: formattedDate.time,
      sunrise: formattedSunrise,
      sunset: formattedSunset,
    };

    res.json(currentWeatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el pronóstico del clima" });
  }
};

export default currentWeather;

import dotenv from "dotenv";
dotenv.config();

const fetchWeatherData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error obteniendo la ubicación");
  return response.json();
};

const getDailyWeather = (data) => {
  const dailyWeather = {};
  const currentDate = new Date();

  data.list.forEach((entry) => {
    const date = new Date(entry.dt * 1000);
    const hour = date.getUTCHours();
    const dayDiff = Math.floor((date - currentDate) / (1000 * 60 * 60 * 24));

    const dayOfWeek =
      dayDiff === 0
        ? "Hoy"
        : dayDiff === 1
        ? "Mañana"
        : date.toLocaleDateString("es-ES", { weekday: "long" });

    const { description: weatherCondition, icon } = entry.weather[0];
    const { temp_min: tempMin, temp_max: tempMax } = entry.main;
    const dayIcon = icon.replace("n", "d");

    if (hour >= 9 && hour <= 18) {
      if (!dailyWeather[dayOfWeek]) {
        dailyWeather[dayOfWeek] = {
          condition: weatherCondition,
          tempMin,
          tempMax,
          icon: dayIcon,
        };
      } else {
        dailyWeather[dayOfWeek].tempMin = Math.min(
          dailyWeather[dayOfWeek].tempMin,
          tempMin
        );
        dailyWeather[dayOfWeek].tempMax = Math.max(
          dailyWeather[dayOfWeek].tempMax,
          tempMax
        );
      }
    }
  });

  return Object.keys(dailyWeather)
    .slice(0, 5)
    .map((day) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      ...dailyWeather[day],
    }));
};

const forecastWeather = async (req, res) => {
  const { city, lat, lon } = req.query;

  if (!city && (!lat || !lon)) {
    return res
      .status(400)
      .json({ error: "Ciudad o coordenadas no proporcionadas" });
  }

  try {
    const weatherApiKey = process.env.WEATHER_API_KEY;
    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;

    const urlWeatherAPI =
      lat && lon
        ? `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${lat},${lon}&days=3&lang=es`
        : `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=3&lang=es`;

    const urlOpenWeather =
      lat && lon
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&lang=es&units=metric`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${openWeatherApiKey}&lang=es&units=metric`;

    const [dataHourly, dataDaily] = await Promise.all([
      fetchWeatherData(urlWeatherAPI),
      fetchWeatherData(urlOpenWeather),
    ]);

    const dailyForecast = getDailyWeather(dataDaily);

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const hourlyForecast = dataHourly.forecast.forecastday
      .flatMap((day) => day.hour)
      .filter(({ time }) => {
        const hourTime = new Date(time);
        return hourTime >= today && hourTime < tomorrow;
      })
      .map(({ time, temp_c, condition }) => ({
        time: time.slice(11, 13),
        temp_c,
        conditionText: condition.text,
        icon: condition.icon,
      }));

    res.json({ hourlyForecast, dailyForecast });
  } catch (error) {
    res.status(404).json({ error: "Ciudad no encontrada" });
  }
};

export default forecastWeather;

import { fetchJson } from "../lib/fetchJson.mjs";
import { formatTimestamp, formatFullDate } from "../utils/dateFormatter.mjs";
import { API_BASE_URL_OPENWEATHER, API_BASE_URL_WEATHERAPI } from "../config/constants.mjs";

export const getCurrentWeatherData = async (city) => {
  const urlOpenWeather = `${API_BASE_URL_OPENWEATHER}/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&lang=es&units=metric`;
  const urlWeatherAPI = `${API_BASE_URL_WEATHERAPI}/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}&lang=es`;

  const [dataOpenWeather, dataWeatherAPI] = await Promise.all([
    fetchJson(urlOpenWeather),
    fetchJson(urlWeatherAPI),
  ]);

  const { main, weather, wind, clouds, sys, visibility, timezone, dt, name } = dataOpenWeather;

  const formattedDate = formatFullDate(dt, timezone);
  const formattedSunrise = formatTimestamp(sys.sunrise, timezone).time;
  const formattedSunset = formatTimestamp(sys.sunset, timezone).time;

  return {
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
    sunrise: formattedSunrise,
    sunset: formattedSunset,
  };
};

const getDailyWeather = (data) => {
  const dailyWeather = {};
  const timezoneOffset = data.city?.timezone || 0; // en segundos
  const currentDate = new Date((Date.now() + timezoneOffset * 1000));

  data.list.forEach((entry) => {
    const date = new Date((entry.dt + timezoneOffset) * 1000);
    const hour = date.getUTCHours();
    const dayDiff = Math.floor(
      (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
        Date.UTC(
          currentDate.getUTCFullYear(),
          currentDate.getUTCMonth(),
          currentDate.getUTCDate()
        )) /
        (1000 * 60 * 60 * 24)
    );

    const dayOfWeek =
      dayDiff === 0
        ? "Hoy"
        : dayDiff === 1
        ? "Mañana"
        : date.toLocaleDateString("es-ES", {
            weekday: "long",
            timeZone: "UTC",
          });

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

export const getForecastData = async (city) => {
  const weatherApiKey = process.env.WEATHER_API_KEY;
  const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
  const urlWeatherAPI = `${API_BASE_URL_WEATHERAPI}/forecast.json?key=${weatherApiKey}&q=${city}&days=3&lang=es`;
  const urlOpenWeather = `${API_BASE_URL_OPENWEATHER}/forecast?q=${city}&appid=${openWeatherApiKey}&lang=es&units=metric`;
  const [dataHourly, dataDaily] = await Promise.all([
    fetchJson(urlWeatherAPI),
    fetchJson(urlOpenWeather),
  ]);

  const dailyForecast = getDailyWeather(dataDaily);

  const fromTimestamp = dataHourly.location?.localtime_epoch
    ? dataHourly.location.localtime_epoch * 1000
    : Date.now();
  const toTimestamp = fromTimestamp + 24 * 60 * 60 * 1000;

  const hourlyForecast = dataHourly.forecast.forecastday
    .flatMap((day) => day.hour)
    .filter(({ time_epoch }) => {
      const epoch = time_epoch * 1000;
      return epoch >= fromTimestamp && epoch < toTimestamp;
    })
    .map(({ time_epoch, temp_c, condition }) => {
      const hourDate = new Date(time_epoch * 1000);
      const displayTime = hourDate.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return {
        time: displayTime,
        temp_c,
        conditionText: condition.text,
        icon: condition.code,
      };
    });

  return { hourlyForecast, dailyForecast };
};
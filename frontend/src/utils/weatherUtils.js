import { format } from "date-fns";
import { es } from "date-fns/locale";
const openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;

// Formatea la marca de tiempo
export const formatTimestamp = (unixTimestamp, timezoneOffset) => {
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

// Formatea la fecha completa
export const formatFullDate = (unixTimestamp, timezoneOffset) => {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  let formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: es });
  return formattedDate.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
};

// Fetch general para obtener datos de una API
export const fetchWeatherData = async (url) => {
  try {
    const response = await fetch(url);

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Ciudad no encontrada.");
      } else {
        throw new Error("Error al obtener datos del clima.");
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en fetchWeatherData:", error);
    throw error; // Lanzar el error para que sea capturado más arriba
  }
};

// Obtiene los datos del clima actual
export const getCurrentWeatherData = async (city) => {
  try {
    const urlOpenWeather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&lang=es&units=metric`;
    const urlWeatherAPI = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}&lang=es`;

    const [dataOpenWeather, dataWeatherAPI] = await Promise.all([
      fetchWeatherData(urlOpenWeather),
      fetchWeatherData(urlWeatherAPI),
    ]);

    const { main, weather, wind, clouds, sys, visibility, timezone, dt, name } =
      dataOpenWeather;

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
      date: formatFullDate(dt, timezone),
      sunrise: formatTimestamp(sys.sunrise, timezone).time,
      sunset: formatTimestamp(sys.sunset, timezone).time,
    };
  } catch (error) {
    console.error("Error obteniendo los datos del clima:", error);
    throw error;
  }
};

// Obtiene la previsión meteorológica diaria
export const getForecastWeatherData = async (city) => {
  try {
    const urlWeatherAPI = `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=3&lang=es`;
    const urlOpenWeather = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${openWeatherApiKey}&lang=es&units=metric`;

    const [dataHourly, dataDaily] = await Promise.all([
      fetchWeatherData(urlWeatherAPI),
      fetchWeatherData(urlOpenWeather),
    ]);

    const dailyForecast = getDailyWeather(dataDaily);
    const hourlyForecast = getHourlyForecast(dataHourly);

    return { dailyForecast, hourlyForecast };
  } catch (error) {
    console.error("Error obteniendo la previsión del clima:", error);
    throw error;
  }
};

// Filtra y organiza la previsión diaria
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

// Filtra y organiza la previsión horaria
const getHourlyForecast = (dataHourly) => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  return dataHourly.forecast.forecastday
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
};

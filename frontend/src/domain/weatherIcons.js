import {
  faSun,
  faMoon,
  faCloud,
  faCloudSun,
  faCloudMoon,
  faCloudRain,
  faCloudShowersHeavy,
  faCloudSunRain,
  faCloudMoonRain,
  faCloudBolt,
  faSnowflake,
  faSmog,
  faIcicles,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Clave de ícono del backend -> ícono + tono. Las claves con sufijo
 * -day / -night ya distinguen día y noche.
 */
const ICONS = {
  "clear-day": { icon: faSun, tone: "sun" },
  "clear-night": { icon: faMoon, tone: "moon" },
  "mostly-clear-day": { icon: faCloudSun, tone: "sun" },
  "mostly-clear-night": { icon: faCloudMoon, tone: "moon" },
  "partly-cloudy-day": { icon: faCloudSun, tone: "sun" },
  "partly-cloudy-night": { icon: faCloudMoon, tone: "moon" },
  overcast: { icon: faCloud, tone: "cloud" },
  fog: { icon: faSmog, tone: "cloud" },
  drizzle: { icon: faCloudRain, tone: "rain" },
  rain: { icon: faCloudRain, tone: "rain" },
  "heavy-rain": { icon: faCloudShowersHeavy, tone: "rain" },
  "showers-day": { icon: faCloudSunRain, tone: "rain" },
  "showers-night": { icon: faCloudMoonRain, tone: "rain" },
  "freezing-rain": { icon: faIcicles, tone: "snow" },
  snow: { icon: faSnowflake, tone: "snow" },
  thunderstorm: { icon: faCloudBolt, tone: "storm" },
};

const FALLBACK = { icon: faCircleQuestion, tone: "cloud" };

export function weatherIcon(key) {
  return ICONS[key] ?? FALLBACK;
}

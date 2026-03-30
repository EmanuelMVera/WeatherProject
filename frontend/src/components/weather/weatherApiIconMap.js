import {
  faSun,
  faMoon,
  faCloud,
  faCloudSun,
  faCloudMoon,
  faCloudShowersHeavy,
  faCloudSunRain,
  faCloudMoonRain,
  faBolt,
  faSnowflake,
  faSmog,
  faCircleQuestion,
} from "../../utils/icons";

/**
 * WeatherAPI condition code mapping to FontAwesome icons
 * Reference: https://www.weatherapi.com/docs/
 * Codes range from 1000-1264, representing different weather conditions
 */
const weatherApiIconMap = {
  // Clear/Sunny
  1000: faSun,

  // Cloudy
  1003: faCloudSun,       // Partly cloudy
  1006: faCloud,          // Cloudy
  1009: faCloud,          // Overcast
  
  // Fog/Mist
  1030: faSmog,           // Mist
  1135: faSmog,           // Fog
  1147: faSmog,           // Freezing fog

  // Patchy conditions
  1063: faCloudSunRain,   // Patchy rain possible
  1066: faSnowflake,      // Patchy snow possible
  1069: faCloudShowersHeavy, // Patchy rain or snow possible
  1072: faCloudShowersHeavy, // Patchy sleet possible
  1075: faCloudShowersHeavy, // Patchy freezing drizzle
  1078: faCloudShowersHeavy, // Light freezing rain
  1087: faBolt,           // Thundery outbreaks possible

  // Blizzard/Heavy snow
  1114: faSnowflake,      // Blizzard
  1117: faSnowflake,      // Blizzard with light snow

  // Drizzle
  1150: faCloudShowersHeavy, // Patchy light drizzle
  1153: faCloudShowersHeavy, // Light drizzle
  1168: faCloudShowersHeavy, // Freezing drizzle
  1171: faCloudShowersHeavy, // Heavy freezing drizzle

  // Rain
  1180: faCloudSunRain,   // Patchy light rain
  1183: faCloudSunRain,   // Light rain
  1186: faCloudShowersHeavy, // Moderate rain at times
  1189: faCloudShowersHeavy, // Moderate rain
  1192: faCloudShowersHeavy, // Heavy rain at times
  1195: faCloudShowersHeavy, // Heavy rain
  1198: faCloudShowersHeavy, // Light freezing rain
  1201: faCloudShowersHeavy, // Moderate or heavy freezing rain

  // Sleet
  1204: faCloudShowersHeavy, // Light sleet
  1207: faCloudShowersHeavy, // Moderate or heavy sleet

  // Snow
  1210: faSnowflake,      // Patchy light snow
  1213: faSnowflake,      // Light snow
  1216: faSnowflake,      // Moderate snow
  1219: faSnowflake,      // Heavy snow
  1222: faSnowflake,      // Ice pellets
  1225: faSnowflake,      // Heavy ice pellets
  1237: faSnowflake,      // Ice pellets

  // Showers
  1240: faCloudSunRain,   // Light rain shower
  1243: faCloudShowersHeavy, // Moderate or heavy rain shower
  1246: faCloudShowersHeavy, // Torrential rain shower
  1249: faCloudShowersHeavy, // Light sleet showers
  1252: faCloudShowersHeavy, // Moderate or heavy sleet showers
  1255: faSnowflake,      // Light snow showers
  1258: faSnowflake,      // Moderate or heavy snow showers
  1261: faSnowflake,      // Light hail showers
  1264: faSnowflake,      // Heavy hail showers
};

const weatherApiIconFallback = faCircleQuestion;

export { weatherApiIconMap, weatherApiIconFallback };

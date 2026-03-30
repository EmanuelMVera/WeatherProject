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

const weatherIconMap = {
  "01d": faSun,
  "01n": faMoon,
  "02d": faCloudSun,
  "02n": faCloudMoon,
  "03d": faCloud,
  "03n": faCloud,
  "04d": faCloud,
  "04n": faCloud,
  "09d": faCloudShowersHeavy,
  "09n": faCloudShowersHeavy,
  "10d": faCloudSunRain,
  "10n": faCloudMoonRain,
  "11d": faBolt,
  "11n": faBolt,
  "13d": faSnowflake,
  "13n": faSnowflake,
  "50d": faSmog,
  "50n": faSmog,
};

const weatherIconFallback = faCircleQuestion;

export { weatherIconMap, weatherIconFallback };

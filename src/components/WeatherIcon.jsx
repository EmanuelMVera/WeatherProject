import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faCloudSun,
  faCloudMoon,
  faSmog,
  faCloud,
  faCloudShowersHeavy,
  faCloudSunRain,
  faCloudMoonRain,
  faCloudBolt,
  faSnowflake,
  faBarsStaggered,
} from "@fortawesome/free-solid-svg-icons";

const iconMap = {
  "01d": faSun,
  "01n": faMoon,
  "02d": faCloudSun,
  "02n": faCloudMoon,
  "03d": faSmog,
  "03n": faSmog,
  "04d": faCloud,
  "04n": faCloud,
  "09d": faCloudShowersHeavy,
  "09n": faCloudShowersHeavy,
  "10d": faCloudSunRain,
  "10n": faCloudMoonRain,
  "11d": faCloudBolt,
  "11n": faCloudBolt,
  "13d": faSnowflake,
  "13n": faSnowflake,
  "50d": faBarsStaggered,
  "50n": faBarsStaggered,
};

const WeatherIcon = ({ icon }) => {
  const IconComponent = iconMap[icon] || faCloud;
  return <FontAwesomeIcon icon={IconComponent} />;
};

export default WeatherIcon;

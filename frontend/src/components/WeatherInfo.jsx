import CurrentWeather from "./CurrentWeather";
import HourlyForecast from "./HourlyForecast";
import styles from "./styles/weatherInfo.module.css";

function WeatherInfo({ currentWeather, hourlyForecast }) {
  return (
    <div className={styles.weatherInfoContainer}>
      <CurrentWeather currentWeather={currentWeather} />
      <HourlyForecast hourlyForecast={hourlyForecast} />
    </div>
  );
}

export default WeatherInfo;

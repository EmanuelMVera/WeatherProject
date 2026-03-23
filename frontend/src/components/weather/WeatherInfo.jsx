import PropTypes from "prop-types";
import CurrentWeather from "./CurrentWeather";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";
import WeatherDetail from "./WeatherDetail";
import styles from "./WeatherInfo.module.css";

function WeatherInfo({ currentWeather, hourlyForecast, dailyForecast }) {
  return (
    <section className={styles.weatherInfoContainer}>
      <div className={styles.topRow}>
        <CurrentWeather currentWeather={currentWeather} />
        <HourlyForecast hourlyForecast={hourlyForecast} />
      </div>
      <div className={styles.bottomRow}>
        <DailyForecast dailyForecast={dailyForecast} />
        <WeatherDetail currentWeather={currentWeather} />
      </div>
    </section>
  );
}

WeatherInfo.propTypes = {
  currentWeather: PropTypes.object.isRequired,
  hourlyForecast: PropTypes.array.isRequired,
  dailyForecast: PropTypes.array.isRequired,
};

export default WeatherInfo;

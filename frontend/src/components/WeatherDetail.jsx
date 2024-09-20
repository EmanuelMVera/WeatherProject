import { useSelector } from "react-redux";
import { selectCurrentWeather } from "../redux/selectors";
import styles from "./styles/weatherDetail.module.css";

const WeatherDetail = () => {
  const currentWeather = useSelector(selectCurrentWeather);

  // Manejo de caso nulo para current
  if (!currentWeather) return null;

  const { temperature, wind, humidity, sunrise, sunset } = currentWeather;
  const { feelsLike } = temperature;
  const { speed } = wind;

  return (
    <div className={styles.weatherDetail}>
      <p>
        <strong>Sensación térmica:</strong> {feelsLike}°C
      </p>
      <p>
        <strong>Humedad:</strong> {humidity}%
      </p>
      <p>
        <strong>Amanecer:</strong> {sunrise}AM
      </p>
      <p>
        <strong>Atardecer:</strong> {sunset}PM
      </p>
      <p>
        <strong>Velocidad del viento:</strong> {speed} km/h
      </p>
    </div>
  );
};

export default WeatherDetail;

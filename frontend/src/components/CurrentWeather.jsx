import { useSelector } from "react-redux";
import styles from "./styles/currentWeather.module.css";
import { selectCurrentWeather } from "../redux/selectors";

const CurrentWeather = () => {
  const currentWeather = useSelector(selectCurrentWeather);

  // Manejo de caso nulo para current
  if (!currentWeather) return null;

  const { city, temperature, date } = currentWeather;
  const { current, description } = temperature;

  return (
    <div className={styles.currentWeather}>
      <h2>{city}</h2>
      <h3>{date}</h3>
      <div className={styles.temp}>
        <span>{current}°</span>
      </div>
      <h3>{description}</h3>
    </div>
  );
};

export default CurrentWeather;

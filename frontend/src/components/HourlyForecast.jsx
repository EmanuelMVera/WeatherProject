import { useSelector } from "react-redux";
import { selectHourlyForecast } from "../redux/selectors";
import styles from "./styles/hourlyForecast.module.css";

const HourlyForecast = () => {
  const hourlyForecast = useSelector(selectHourlyForecast);

  if (!hourlyForecast || hourlyForecast.length === 0) return null; // Manejo de caso nulo

  return (
    <div className={styles.hourlyForecast}>
      <p>Pronóstico por hora:</p>
      <div className={styles.forecast}>
        {hourlyForecast.map(({ time, icon, temp_c }, index) => (
          <div className={styles.hour} key={index}>
            <span>{temp_c}°</span>
            <img src={icon} alt="weather icon" className={styles.weatherIcon} />
            <span>{time}hs</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;

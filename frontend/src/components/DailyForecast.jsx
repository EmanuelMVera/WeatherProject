import { useSelector } from "react-redux";
import { selectDailyForecast } from "../redux/selectors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles/dailyForecast.module.css";

const DailyForecast = () => {
  const dailyForecast = useSelector(selectDailyForecast);

  if (!dailyForecast || dailyForecast.length === 0) return null; // Manejo de caso nulo

  return (
    <div className={styles.dailyForecast}>
      {dailyForecast.map(
        // ({ icon, day, condition, tempMin, tempMax }, index) => (
        ({ icon, day, tempMin, tempMax }, index) => (
          <div className={styles.day} key={index}>
            <span className={styles.dayText}>{day}</span>
            <img
              src={`https://openweathermap.org/img/wn/${icon}.png`}
              alt="daily icon"
              className={styles.weatherIcon}
            />
            <span className={styles.temperature}>
              <div className={styles.tempMin}>
                <FontAwesomeIcon icon={faArrowDown} style={{ color: "blue" }} />
                {tempMin}°
              </div>
              <div className={styles.tempMax}>
                <FontAwesomeIcon icon={faArrowUp} style={{ color: "red" }} />
                {tempMax}°
              </div>
            </span>
          </div>
        )
      )}
    </div>
  );
};

export default DailyForecast;

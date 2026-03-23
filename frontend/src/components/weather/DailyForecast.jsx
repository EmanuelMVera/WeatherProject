import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./DailyForecast.module.css";

const DailyForecast = ({ dailyForecast }) => (
  <section className={styles.block}>
    <h3 className={styles.title}>Proximos dias</h3>
    <div className={styles.dailyForecast}>
      {dailyForecast.map(({ icon, day, tempMin, tempMax }, index) => (
        <article className={styles.day} key={`${day}-${index}`}>
          <p className={styles.dayText}>{day}</p>
          <img
            src={`https://openweathermap.org/img/wn/${icon}.png`}
            alt={`Pronostico para ${day}`}
            className={styles.weatherIcon}
          />
          <p className={styles.temperature}>
            <span className={styles.min}>
              <FontAwesomeIcon icon={faArrowDown} /> {Math.round(tempMin)}°
            </span>
            <span className={styles.max}>
              <FontAwesomeIcon icon={faArrowUp} /> {Math.round(tempMax)}°
            </span>
          </p>
        </article>
      ))}
    </div>
  </section>
);

DailyForecast.propTypes = {
  dailyForecast: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string.isRequired,
      day: PropTypes.string.isRequired,
      tempMin: PropTypes.number.isRequired,
      tempMax: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default DailyForecast;

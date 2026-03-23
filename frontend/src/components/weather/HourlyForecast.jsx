import PropTypes from "prop-types";
import styles from "./HourlyForecast.module.css";

const HourlyForecast = ({ hourlyForecast }) => (
  <section className={styles.block}>
    <h3 className={styles.title}>Proximas horas</h3>
    <div className={styles.hourlyForecast}>
      {hourlyForecast.map(({ time, icon, temp_c }, index) => (
        <article className={styles.hour} key={`${time}-${index}`}>
          <p className={styles.time}>{time}:00</p>
          <img src={icon} alt="Icono meteorologico" className={styles.weatherIcon} />
          <p className={styles.temp}>{Math.round(temp_c)}°</p>
        </article>
      ))}
    </div>
  </section>
);

HourlyForecast.propTypes = {
  hourlyForecast: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      temp_c: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default HourlyForecast;

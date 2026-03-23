import PropTypes from "prop-types";
import styles from "./CurrentWeather.module.css";

const CurrentWeather = ({ currentWeather }) => {
  const { city, country, temperature, date } = currentWeather;
  const { current, description, icon } = temperature;

  return (
    <article className={styles.currentWeather}>
      <p className={styles.kicker}>Ahora</p>
      <h2 className={styles.city}>
        {city}, {country}
      </h2>
      <p className={styles.date}>{date}</p>
      <div className={styles.mainRow}>
        <img
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
          alt={description}
          className={styles.weatherIcon}
        />
        <p className={styles.temp}>{Math.round(current)}°</p>
      </div>
      <p className={styles.description}>{description}</p>
    </article>
  );
};

CurrentWeather.propTypes = {
  currentWeather: PropTypes.shape({
    city: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    temperature: PropTypes.shape({
      current: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default CurrentWeather;

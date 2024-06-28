import React from "react";
import styles from "./styles/forecast.module.css";
import PropTypes from "prop-types";

const DailyForecast = ({ forecastData }) => {
  return (
    <div className={styles.forecast}>
      {forecastData.map((day) => (
        <div key={day.date} className={styles.forecastItem}>
          <div>
            {new Date(day.date).toLocaleDateString("en-EN", {
              weekday: "long",
            })}
          </div>
          <div>{day.avgTemp}°C</div>
          <div>{day.weather}</div>
        </div>
      ))}
    </div>
  );
};

DailyForecast.propTypes = {
  forecastData: PropTypes.array.isRequired,
};

export default DailyForecast;

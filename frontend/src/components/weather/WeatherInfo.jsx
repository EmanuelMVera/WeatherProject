import React, { Suspense, lazy } from "react";
import CurrentWeather from "./CurrentWeather";
import SkeletonLoader from "../SkeletonLoader";
import styles from "./WeatherInfo.module.css";

const HourlyForecast = lazy(() => import("./HourlyForecast"));
const DailyForecast = lazy(() => import("./DailyForecast"));
const WeatherDetail = lazy(() => import("./WeatherDetail"));

function WeatherInfo({ currentWeather, hourlyForecast, dailyForecast }) {
  return (
    <section className={styles.weatherInfoContainer}>
      <div className={styles.topRow}>
        <CurrentWeather currentWeather={currentWeather} />
        <Suspense fallback={<SkeletonLoader type="hourly" />}>
          <HourlyForecast hourlyForecast={hourlyForecast} />
        </Suspense>
      </div>
      <div className={styles.bottomRow}>
        <Suspense fallback={<SkeletonLoader type="daily" />}>
          <DailyForecast dailyForecast={dailyForecast} />
        </Suspense>
        <Suspense fallback={<SkeletonLoader type="detail" />}>
          <WeatherDetail currentWeather={currentWeather} />
        </Suspense>
      </div>
    </section>
  );
}

export default WeatherInfo;

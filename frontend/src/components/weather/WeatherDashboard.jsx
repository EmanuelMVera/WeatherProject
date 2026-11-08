import { useMemo } from "react";
import CurrentWeatherCard from "./CurrentWeatherCard";
import SunCard from "./SunCard";
import UvCard from "./UvCard";
import AlertsCard from "./AlertsCard";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";
import PrecipitationCard from "./PrecipitationCard";
import ActivityTips from "./ActivityTips";
import { localDateOf } from "../../lib/format";
import styles from "./WeatherDashboard.module.css";

/**
 * Distribución del contenido. En el celular es una sola columna con el
 * clima actual primero; en tablet y escritorio las áreas de la grilla
 * cambian (no se achica el diseño de escritorio).
 */
export default function WeatherDashboard({ place, data, now, isWide, favorite, status, alerts }) {
  const tz = data.location.timezone;
  const todayStr = localDateOf(now, tz);

  // Descartamos horas ya pasadas (por ejemplo, si se muestran datos guardados).
  const hours = useMemo(() => data.hourly.filter((h) => Date.parse(h.time) + 3600_000 > now), [data.hourly, now]);
  const days = useMemo(() => data.daily.filter((d) => d.date >= todayStr), [data.daily, todayStr]);
  const today = days.find((d) => d.date === todayStr) ?? null;
  const placeName = place.source === "geolocation" ? "tu ubicación" : place.name;

  return (
    <div className={styles.grid}>
      <div className={styles.current}>
        <CurrentWeatherCard
          place={place}
          data={data}
          today={today}
          isFavorite={favorite.isFavorite}
          canFavorite={favorite.canFavorite}
          onToggleFavorite={favorite.onToggle}
          status={status}
        />
      </div>
      <div className={styles.sun}>
        <SunCard today={today} timeZone={tz} now={now} />
      </div>
      <div className={styles.uv}>
        <UvCard today={today} current={data.current} />
      </div>
      <div className={styles.alerts}>
        <AlertsCard state={alerts} timeZone={tz} now={now} placeName={placeName} />
      </div>
      <div className={styles.hourly}>
        <HourlyForecast hours={hours} timeZone={tz} todayStr={todayStr} />
      </div>
      <div className={styles.daily}>
        <DailyForecast days={days} hours={hours} timeZone={tz} todayStr={todayStr} isWide={isWide} />
      </div>
      <div className={styles.rain}>
        <PrecipitationCard hours={hours} today={today} timeZone={tz} />
      </div>
      <div className={styles.activities}>
        <ActivityTips current={data.current} hours={hours} timeZone={tz} />
      </div>
    </div>
  );
}

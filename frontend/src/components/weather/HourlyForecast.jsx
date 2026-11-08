import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faChevronLeft, faChevronRight, faDroplet } from "@fortawesome/free-solid-svg-icons";
import Card from "../ui/Card";
import WeatherIcon from "../ui/WeatherIcon";
import {
  formatMm,
  formatTemp,
  formatTime,
  formatWeekday,
  relativeDayLabel,
  formatShortDate,
} from "../../lib/format";
import styles from "./HourlyForecast.module.css";

export const HOURLY_LIMIT = 48;

/**
 * Carrusel horizontal de las próximas 48 horas. Táctil (scroll nativo con
 * snap), navegable con teclado (el contenedor recibe foco) y con botones
 * de desplazamiento en pantallas con mouse.
 */
export default function HourlyForecast({ hours, timeZone, todayStr }) {
  const scrollerRef = useRef(null);
  const items = hours.slice(0, HOURLY_LIMIT);

  const scrollBy = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const actions = (
    <div className={styles.controls}>
      <button type="button" className={styles.arrow} onClick={() => scrollBy(-1)} aria-label="Horas anteriores">
        <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" />
      </button>
      <button type="button" className={styles.arrow} onClick={() => scrollBy(1)} aria-label="Horas siguientes">
        <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <Card
      id="por-hora"
      title="Pronóstico por horas"
      icon={faClock}
      actions={items.length > 0 ? actions : null}
      subtitle="Próximas 48 horas · hora local de la ciudad"
    >
      {items.length === 0 ? (
        <p className={styles.empty}>No hay pronóstico por hora disponible.</p>
      ) : (
        <ol
          ref={scrollerRef}
          className={styles.scroller}
          tabIndex={0}
          aria-label="Pronóstico por hora. Desplazá horizontalmente para ver más."
        >
          {items.map((hour, index) => {
            const newDay = index === 0 || hour.localDate !== items[index - 1].localDate;
            const dayLabel = newDay
              ? index === 0
                ? relativeDayLabel(hour.localDate, todayStr)
                : `${formatWeekday(hour.localDate, "short")} ${formatShortDate(hour.localDate)}`
              : null;
            const timeLabel = index === 0 ? "Ahora" : `${formatTime(hour.time, timeZone)}`;
            const prob = hour.precipitationProbability;
            const mm = hour.precipitation;
            return (
              <li key={hour.time} className={`${styles.hour} ${newDay && index > 0 ? styles.dayStart : ""}`}>
                <span className={styles.day} aria-hidden={dayLabel ? undefined : true}>
                  {dayLabel ?? " "}
                </span>
                <span className={styles.time}>{timeLabel}</span>
                <WeatherIcon iconKey={hour.condition.icon} label={hour.condition.description} size="md" />
                <span className={styles.temp}>{formatTemp(hour.temperature)}</span>
                <span className={`${styles.rain} ${prob >= 50 ? styles.rainLikely : ""}`}>
                  <FontAwesomeIcon icon={faDroplet} aria-hidden="true" />
                  <span className="visually-hidden">Probabilidad de lluvia </span>
                  {prob == null ? "—" : `${prob}%`}
                </span>
                <span className={styles.mm}>
                  {mm != null && mm >= 0.1 ? (
                    <>
                      <span className="visually-hidden">Cantidad prevista </span>
                      {formatMm(mm)}
                    </>
                  ) : (
                    <span aria-hidden="true">&nbsp;</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

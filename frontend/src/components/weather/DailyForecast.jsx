import { useId, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faChevronDown, faDroplet } from "@fortawesome/free-solid-svg-icons";
import Card from "../ui/Card";
import WeatherIcon from "../ui/WeatherIcon";
import DayDetail from "./DayDetail";
import { formatShortDate, formatTemp, formatWeekday, relativeDayLabel } from "../../lib/format";
import styles from "./DailyForecast.module.css";

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Lista de 7 días. En pantallas anchas el detalle se muestra en un panel
 * lateral; en el celular se expande dentro de la lista (acordeón).
 */
export default function DailyForecast({ days, hours, timeZone, todayStr, isWide }) {
  const baseId = useId();
  const [expanded, setExpanded] = useState(null); // modo acordeón
  const [selected, setSelected] = useState(null); // modo panel

  const hoursByDate = useMemo(() => {
    const map = new Map();
    for (const h of hours) {
      if (!map.has(h.localDate)) map.set(h.localDate, []);
      map.get(h.localDate).push(h);
    }
    return map;
  }, [hours]);

  // Escala común para las barras de rango de temperatura.
  const [weekMin, weekMax] = useMemo(() => {
    const mins = days.map((d) => d.temperatureMin).filter(isNum);
    const maxs = days.map((d) => d.temperatureMax).filter(isNum);
    return [Math.min(...mins), Math.max(...maxs)];
  }, [days]);
  const span = Math.max(weekMax - weekMin, 1);

  if (days.length === 0) {
    return (
      <Card id="siete-dias" title="Pronóstico de 7 días" icon={faCalendarDays}>
        <p className={styles.empty}>No hay pronóstico diario disponible.</p>
      </Card>
    );
  }

  const selectedDate = selected && days.some((d) => d.date === selected) ? selected : days[0].date;
  const selectedDay = days.find((d) => d.date === selectedDate);
  const panelId = `${baseId}-panel`;

  return (
    <Card
      id="siete-dias"
      title="Pronóstico de 7 días"
      icon={faCalendarDays}
      subtitle={isWide ? "Hacé clic en un día para ver el detalle" : "Tocá un día para ver el detalle"}
      className={styles.card}
    >
      <div className={isWide ? styles.split : undefined}>
        <ul className={styles.list}>
          {days.map((day) => {
            const label = relativeDayLabel(day.date, todayStr);
            const isOpen = isWide ? day.date === selectedDate : expanded === day.date;
            const detailId = `${baseId}-${day.date}`;
            const hasRange = isNum(day.temperatureMin) && isNum(day.temperatureMax);
            const left = hasRange ? ((day.temperatureMin - weekMin) / span) * 100 : 0;
            const width = hasRange ? ((day.temperatureMax - day.temperatureMin) / span) * 100 : 0;

            return (
              <li key={day.date} className={styles.item}>
                <button
                  type="button"
                  className={`${styles.row} ${isOpen ? styles.open : ""}`}
                  aria-expanded={isWide ? undefined : isOpen}
                  aria-pressed={isWide ? isOpen : undefined}
                  aria-controls={isWide ? panelId : detailId}
                  onClick={() =>
                    isWide ? setSelected(day.date) : setExpanded((cur) => (cur === day.date ? null : day.date))
                  }
                >
                  <span className={styles.day}>
                    <span className={styles.dayName}>
                      <span className={styles.long}>{label}</span>
                      <span className={styles.short} aria-hidden="true">
                        {label.length > 6 ? capitalize(formatWeekday(day.date, "short")) : label}
                      </span>
                    </span>
                    <span className={styles.date}>{formatShortDate(day.date)}</span>
                  </span>
                  <WeatherIcon iconKey={day.condition.icon} label={day.condition.description} size="sm" />
                  <span className={styles.prob}>
                    <FontAwesomeIcon icon={faDroplet} aria-hidden="true" />
                    <span className="visually-hidden">Probabilidad de lluvia </span>
                    {day.precipitationProbabilityMax == null ? "—" : `${day.precipitationProbabilityMax}%`}
                  </span>
                  <span className={styles.min}>
                    <span className="visually-hidden">Mínima </span>
                    {formatTemp(day.temperatureMin)}
                  </span>
                  <span className={styles.bar} aria-hidden="true">
                    {hasRange && <span className={styles.range} style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }} />}
                  </span>
                  <span className={styles.max}>
                    <span className="visually-hidden">Máxima </span>
                    {formatTemp(day.temperatureMax)}
                  </span>
                  {!isWide && (
                    <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} aria-hidden="true" />
                  )}
                </button>
                {!isWide && isOpen && (
                  <div id={detailId} className={styles.inlineDetail}>
                    <DayDetail
                      day={day}
                      hours={hoursByDate.get(day.date) ?? []}
                      timeZone={timeZone}
                      todayStr={todayStr}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {isWide && selectedDay && (
          <div id={panelId} className={styles.panel} aria-live="polite">
            <DayDetail
              day={selectedDay}
              hours={hoursByDate.get(selectedDay.date) ?? []}
              timeZone={timeZone}
              todayStr={todayStr}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

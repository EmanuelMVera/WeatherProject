import WeatherIcon from "../ui/WeatherIcon";
import {
  formatDuration,
  formatKmh,
  formatLongDate,
  formatMm,
  formatNumber,
  formatPercent,
  formatTemp,
  formatTime,
  relativeDayLabel,
} from "../../lib/format";
import { uvCategory } from "../../domain/uv";
import { windDirection } from "../../domain/wind";
import { describeDayRain, summarizeByPeriod } from "../../domain/precipitation";
import styles from "./DayDetail.module.css";

function Stat({ label, children, tone }) {
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd className={tone ? styles[tone] : undefined}>{children}</dd>
    </div>
  );
}

/**
 * Detalle de un día del pronóstico.
 * @param {{ day: object, hours: object[], timeZone: string, todayStr: string, headingLevel?: 3|4 }} props
 */
export default function DayDetail({ day, hours, timeZone, todayStr, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  const uv = uvCategory(day.uvIndexMax);
  const dir = windDirection(day.windDirectionDominant);
  const isToday = day.date === todayStr;
  const baseSentence = describeDayRain(hours);
  // Para hoy sólo miramos las horas que faltan: aclaramos que la lluvia
  // del total diario pudo haber ocurrido antes.
  const rainSentence =
    isToday && baseSentence === "No se prevé lluvia." && (day.precipitationSum ?? 0) >= 0.1
      ? "No se prevé más lluvia hoy."
      : baseSentence;
  const periods = summarizeByPeriod(hours);

  return (
    <div className={styles.detail}>
      <div className={styles.head}>
        <WeatherIcon iconKey={day.condition.icon} size="md" />
        <div>
          <Heading className={styles.title}>
            {isToday ? "Hoy, " : relativeDayLabel(day.date, todayStr) === "Mañana" ? "Mañana, " : ""}
            {formatLongDate(day.date)}
          </Heading>
          <p className={styles.condition}>
            {day.condition.description}
            {rainSentence ? ` · ${rainSentence.replace(/\.$/, "")}` : ""}
          </p>
        </div>
      </div>

      <dl className={styles.grid}>
        <Stat label="Máxima" tone="max">{formatTemp(day.temperatureMax)}</Stat>
        <Stat label="Mínima" tone="min">{formatTemp(day.temperatureMin)}</Stat>
        <Stat label="Sensación máx.">{formatTemp(day.apparentTemperatureMax)}</Stat>
        <Stat label="Sensación mín.">{formatTemp(day.apparentTemperatureMin)}</Stat>
        <Stat label="Prob. de lluvia" tone="rain">{formatPercent(day.precipitationProbabilityMax)}</Stat>
        <Stat label="Lluvia acumulada" tone="rain">{formatMm(day.precipitationSum)}</Stat>
        <Stat label="Viento máx.">
          {formatKmh(day.windSpeedMax)}
          {dir ? ` · ${dir.short}` : ""}
        </Stat>
        <Stat label="Ráfagas máx.">{formatKmh(day.windGustsMax)}</Stat>
        <Stat label="UV máximo">
          {day.uvIndexMax == null ? "—" : formatNumber(Math.round(day.uvIndexMax))}
          {uv ? ` · ${uv.label}` : ""}
        </Stat>
        <Stat label="Horas con lluvia">
          {day.precipitationHours == null ? "—" : `${formatNumber(day.precipitationHours)} h`}
        </Stat>
        <Stat label="Amanecer">{day.sunrise ? formatTime(day.sunrise, timeZone) : "Sin dato"}</Stat>
        <Stat label="Atardecer">{day.sunset ? formatTime(day.sunset, timeZone) : "Sin dato"}</Stat>
      </dl>

      {day.daylightDuration != null && (
        <p className={styles.note}>Horas de luz: {formatDuration(day.daylightDuration)}</p>
      )}

      {rainSentence && (
        <div className={styles.rain}>
          <p className={styles.rainSentence}>Probabilidad de lluvia por franja</p>
          <ul className={styles.periods} aria-label="Probabilidad de lluvia por franja">
            {periods.map((p) => (
              <li key={p.key}>
                <span className={styles.periodLabel}>{p.label}</span>
                <span className={styles.periodValue}>{formatPercent(p.maxProbability)}</span>
                {p.totalMm != null && p.totalMm >= 0.1 && (
                  <span className={styles.periodMm}>{formatMm(p.totalMm)}</span>
                )}
              </li>
            ))}
          </ul>
          {isToday && <p className={styles.note}>Para hoy se consideran sólo las horas que faltan.</p>}
        </div>
      )}
    </div>
  );
}

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUmbrella, faCloudRain } from "@fortawesome/free-solid-svg-icons";
import Card from "../ui/Card";
import { formatMm, formatPercent, formatTime } from "../../lib/format";
import { summarizeUpcomingRain } from "../../domain/precipitation";
import styles from "./PrecipitationCard.module.css";

const WINDOW_HOURS = 24;

/**
 * Lluvia: totales previstos del día y detalle de las próximas 24 h.
 * Separa siempre la probabilidad (%) de la cantidad estimada (mm).
 */
export default function PrecipitationCard({ hours, today, timeZone }) {
  const next = hours.slice(0, WINDOW_HOURS);
  const summary = summarizeUpcomingRain(next, (iso) => formatTime(iso, timeZone));
  const hasHourly = next.length > 0 && summary.maxProbability != null;

  return (
    <Card id="lluvia" title="Precipitaciones" icon={faUmbrella}>
      {today && (
        <div className={styles.today}>
          <FontAwesomeIcon icon={faCloudRain} className={styles.todayIcon} aria-hidden="true" />
          <dl className={styles.todayStats}>
            <div>
              <dd>{formatPercent(today.precipitationProbabilityMax)}</dd>
              <dt>Probabilidad máx. hoy</dt>
            </div>
            <div>
              <dd>{formatMm(today.precipitationSum)}</dd>
              <dt>Acumulado previsto hoy</dt>
            </div>
          </dl>
        </div>
      )}

      {!hasHourly ? (
        <p className={styles.text}>No hay datos de precipitación por hora disponibles.</p>
      ) : (
        <>
          <p className={styles.sentence}>{summary.sentence}</p>
          {summary.peakIntensity && (
            <p className={styles.peak}>
              Momento más intenso: lluvia {summary.peakIntensity.label} a las{" "}
              {formatTime(summary.peak.time, timeZone)} ({formatMm(summary.peak.precipitation)} en esa hora).
            </p>
          )}
          {summary.totalMm != null && summary.totalMm >= 0.1 && (
            <p className={styles.peak}>Total estimado en 24 h: {formatMm(summary.totalMm)}.</p>
          )}

          <div className={styles.chart} aria-hidden="true">
            {next.map((h, i) => {
              const prob = h.precipitationProbability ?? 0;
              return (
                <div key={h.time} className={styles.col}>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.bar} ${prob >= 50 ? styles.barLikely : ""}`}
                      style={{ height: `${Math.max(prob, 2)}%` }}
                    />
                  </div>
                  <span className={styles.tick}>{i % 6 === 0 ? `${formatTime(h.time, timeZone).slice(0, 2)} h` : ""}</span>
                </div>
              );
            })}
          </div>
          <p className={styles.legend}>
            Barras: <strong>probabilidad</strong> de lluvia por hora en las próximas 24 h (0–100 %). Los
            milímetros son una estimación del modelo.
          </p>
        </>
      )}
    </Card>
  );
}

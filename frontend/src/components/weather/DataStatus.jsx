import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate, faTriangleExclamation, faClock } from "@fortawesome/free-solid-svg-icons";
import { formatRelativeTime, formatTime } from "../../lib/format";
import buttonStyles from "../ui/Button.module.css";
import styles from "./DataStatus.module.css";

/**
 * Procedencia y antigüedad de los datos. Distingue:
 * - la hora de referencia meteorológica (`current.time`, paso del modelo),
 * - la última consulta exitosa desde este dispositivo.
 */
export default function DataStatus({ source, observedAt, timeZone, timeZoneLabel, fetchedAt, stale, loading, onRefresh, now }) {
  return (
    <div className={styles.status}>
      <p className={styles.text}>
        {observedAt && (
          <span>
            <FontAwesomeIcon icon={faClock} aria-hidden="true" /> Datos de las {formatTime(observedAt, timeZone)} (hora
            local{timeZoneLabel ? `, ${timeZoneLabel}` : ""})
          </span>
        )}
        <span aria-live="polite">
          {loading ? "Actualizando…" : fetchedAt ? `Consultado ${formatRelativeTime(fetchedAt, now)}` : null}
        </span>
        <span>
          Fuente:{" "}
          <a href={source?.url} target="_blank" rel="noopener noreferrer">
            {source?.name ?? "Open-Meteo"}
          </a>
        </span>
        {stale && !loading && (
          <span className={styles.stale}>
            <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> Datos desactualizados
          </span>
        )}
      </p>
      <button
        type="button"
        className={`${buttonStyles.button} ${buttonStyles.small}`}
        onClick={onRefresh}
        disabled={loading}
      >
        <FontAwesomeIcon icon={faArrowsRotate} className={loading ? buttonStyles.spin : undefined} aria-hidden="true" />
        Actualizar
      </button>
    </div>
  );
}

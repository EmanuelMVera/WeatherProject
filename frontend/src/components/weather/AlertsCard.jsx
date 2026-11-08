import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faArrowUpRightFromSquare,
  faCircleCheck,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { formatShortDate, formatTime, localDateOf, formatRelativeTime } from "../../lib/format";
import styles from "./AlertsCard.module.css";

const SMN_URL = "https://www.smn.gob.ar/alertas";

function SmnLink() {
  return (
    <a className={styles.link} href={SMN_URL} target="_blank" rel="noopener noreferrer">
      Ver en smn.gob.ar
      <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
      <span className="visually-hidden"> (se abre en otra pestaña)</span>
    </a>
  );
}

function when(iso, tz) {
  return `${formatShortDate(localDateOf(iso, tz))} ${formatTime(iso, tz)}`;
}

/**
 * Alertas oficiales en forma de banner. Nunca afirma "no hay alertas" sin
 * haber consultado al SMN con éxito; fuera de Argentina explica la cobertura.
 */
export default function AlertsCard({ state, timeZone, now, placeName }) {
  const headingId = useId();
  const { status, data } = state;
  let tone = "neutral";
  let icon = faCircleInfo;
  let body;

  if (status === "not-covered") {
    body = (
      <p className={styles.text}>
        Por ahora integramos las alertas oficiales del Servicio Meteorológico Nacional de Argentina.
        Para esta localidad, consultá el servicio meteorológico oficial de su país.
      </p>
    );
  } else if (status === "loading" || status === "idle") {
    body = <p className={styles.text}>Consultando alertas del SMN…</p>;
  } else if (status === "error") {
    tone = "warning";
    icon = faTriangleExclamation;
    body = (
      <p className={styles.text}>
        No pudimos consultar las alertas del SMN en este momento. Revisalas directamente en el sitio oficial.
      </p>
    );
  } else if (data.alerts.length > 0) {
    const severe = data.alerts.some((a) => a.severity === "Severe" || a.severity === "Extreme");
    tone = severe ? "danger" : "warning";
    icon = faTriangleExclamation;
    body = (
      <ul className={styles.list}>
        {data.alerts.map((alert) => (
          <li key={alert.id} className={styles.alert}>
            <p className={styles.event}>
              {alert.event}
              <span className={styles.severity}>Severidad: {alert.severityLabel.toLowerCase()}</span>
            </p>
            <p className={styles.period}>
              {alert.onset ? `Desde ${when(alert.onset, timeZone)} · ` : ""}Hasta {when(alert.expires, timeZone)}
            </p>
            {alert.description && <p className={styles.description}>{alert.description}</p>}
            {alert.instruction && (
              <details className={styles.details}>
                <summary>Recomendaciones del SMN</summary>
                <p>{alert.instruction}</p>
              </details>
            )}
          </li>
        ))}
      </ul>
    );
  } else if (data.partial) {
    tone = "warning";
    body = (
      <p className={styles.text}>
        No encontramos alertas para esta ubicación, pero parte de la información del SMN no se pudo
        leer. Confirmalo en el sitio oficial.
      </p>
    );
  } else {
    tone = "ok";
    icon = faCircleCheck;
    body = (
      <>
        <p className={styles.text}>
          El SMN no tiene alertas vigentes para {placeName ? placeName : "esta ubicación"}.
        </p>
        <p className={styles.meta}>
          Consultado {formatRelativeTime(Date.parse(data.checkedAt), now)}
          {data.stale ? " (información posiblemente desactualizada)" : ""}.
        </p>
      </>
    );
  }

  return (
    <section className={`${styles.banner} ${styles[tone]}`} aria-labelledby={headingId}>
      <FontAwesomeIcon icon={icon} className={styles.icon} aria-hidden="true" />
      <div className={styles.body} aria-live="polite">
        <h2 id={headingId} className={styles.title}>
          {status === "not-covered" ? "Alertas oficiales" : "Alertas meteorológicas (SMN)"}
        </h2>
        {body}
      </div>
      {status !== "not-covered" && status !== "loading" && status !== "idle" && <SmnLink />}
    </section>
  );
}

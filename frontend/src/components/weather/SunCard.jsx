import { faSun } from "@fortawesome/free-solid-svg-icons";
import Card from "../ui/Card";
import { formatDuration, formatTime } from "../../lib/format";
import styles from "./SunUvCard.module.css";

/** Amanecer y atardecer en la hora local de la ciudad, con el avance del día. */
export default function SunCard({ today, timeZone, now }) {
  const sunrise = today?.sunrise;
  const sunset = today?.sunset;
  const rise = sunrise ? Date.parse(sunrise) : null;
  const set = sunset ? Date.parse(sunset) : null;
  const progress = rise && set && now >= rise && now <= set ? (now - rise) / (set - rise) : null;

  return (
    <Card title="Sol" icon={faSun} className={styles.card}>
      <dl className={styles.sunTimes}>
        <div>
          <dt>Amanecer</dt>
          <dd>{sunrise ? formatTime(sunrise, timeZone) : "Sin dato"}</dd>
        </div>
        <div className={styles.right}>
          <dt>Atardecer</dt>
          <dd>{sunset ? formatTime(sunset, timeZone) : "Sin dato"}</dd>
        </div>
      </dl>
      {rise && set && (
        <div className={styles.track} aria-hidden="true">
          {progress != null && <span className={styles.sunDot} style={{ left: `${progress * 100}%` }} />}
        </div>
      )}
      {today?.daylightDuration != null && (
        <p className={styles.note}>Horas de luz: {formatDuration(today.daylightDuration)}</p>
      )}
    </Card>
  );
}

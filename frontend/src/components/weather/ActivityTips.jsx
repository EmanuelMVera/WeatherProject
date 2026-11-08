import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPersonWalking,
  faPersonRunning,
  faPersonBiking,
  faPersonHiking,
  faCircleCheck,
  faTriangleExclamation,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import Card from "../ui/Card";
import { evaluateConditions, LEVEL_LABELS, recommendActivities, summarizeOutlook } from "../../domain/activities";
import styles from "./ActivityTips.module.css";

const ICONS = { walk: faPersonWalking, run: faPersonRunning, bike: faPersonBiking };
const LEVEL_ICONS = { good: faCircleCheck, caution: faTriangleExclamation, bad: faBan };

/** Recomendaciones orientativas basadas en los mismos datos que se muestran. */
export default function ActivityTips({ current, hours, timeZone }) {
  const recs = recommendActivities(evaluateConditions({ current, hourly: hours }));
  const outlook = recs ? summarizeOutlook(recs, hours, timeZone) : null;

  return (
    <Card id="actividades" title="Actividades al aire libre" icon={faPersonHiking} subtitle="Para las próximas 3 horas">
      {!recs ? (
        <p className={styles.note}>No hay datos suficientes para recomendar actividades.</p>
      ) : (
        <>
          <div className={styles.outlook}>
            <span className={`${styles.overall} ${styles[outlook.level]}`}>
              <FontAwesomeIcon icon={LEVEL_ICONS[outlook.level]} aria-hidden="true" />
              {outlook.title}
            </span>
            {outlook.tips.length > 0 && (
              <ul className={styles.tips}>
                {outlook.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
          <ul className={styles.list}>
            {recs.map((rec) => (
              <li key={rec.key} className={styles.item}>
                <FontAwesomeIcon icon={ICONS[rec.key]} className={styles.icon} aria-hidden="true" />
                <div className={styles.body}>
                  <p className={styles.head}>
                    <span className={styles.label}>{rec.label}</span>
                    <span className={`${styles.badge} ${styles[rec.level]}`}>{LEVEL_LABELS[rec.level]}</span>
                  </p>
                  <ul className={styles.reasons}>
                    {rec.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className={styles.note}>Sugerencias orientativas. No reemplazan las alertas ni las indicaciones oficiales.</p>
    </Card>
  );
}

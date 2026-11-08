import { faSun } from "@fortawesome/free-regular-svg-icons";
import Card from "../ui/Card";
import { formatNumber } from "../../lib/format";
import { uvCategory } from "../../domain/uv";
import styles from "./SunUvCard.module.css";

const UV_SCALE_MAX = 12;

function UvValue({ label, value }) {
  const category = uvCategory(value);
  return (
    <div className={styles.uvValue}>
      <dt>{label}</dt>
      <dd>
        <span className={styles.uvNumber}>{value == null ? "—" : formatNumber(Math.round(value))}</span>
        {category && <span className={`${styles.badge} ${styles[category.key]}`}>{category.label}</span>}
      </dd>
    </div>
  );
}

/** Índice UV: valor actual frente al máximo previsto del día (escala OMS). */
export default function UvCard({ today, current }) {
  // De noche el índice UV es 0 aunque el modelo no lo informe.
  const uvNow = current?.isDay === false ? 0 : current?.uvIndex ?? null;
  const uvMax = today?.uvIndexMax ?? null;
  const maxCategory = uvCategory(uvMax);

  return (
    <Card title="Índice UV" icon={faSun} className={styles.card}>
      <dl className={styles.uv}>
        <UvValue label="Ahora" value={uvNow} />
        <UvValue label="Máximo hoy" value={uvMax} />
      </dl>
      <div className={styles.scale} aria-hidden="true">
        {uvMax != null && (
          <span className={styles.marker} style={{ left: `${(Math.min(uvMax, UV_SCALE_MAX) / UV_SCALE_MAX) * 100}%` }} />
        )}
      </div>
      {maxCategory && <p className={styles.note}>{maxCategory.advice}</p>}
    </Card>
  );
}

import styles from "./Skeleton.module.css";

/**
 * Esqueleto del tablero mientras llega el primer pronóstico. Reserva el
 * mismo espacio que el contenido real para evitar saltos de diseño (CLS).
 */
export default function DashboardSkeleton() {
  return (
    <div className={styles.grid} aria-hidden="true">
      <div className={`${styles.block} ${styles.current}`}>
        <div className={styles.line} style={{ width: "45%" }} />
        <div className={styles.line} style={{ width: "30%" }} />
        <div className={styles.hero} />
        <div className={styles.line} style={{ width: "60%" }} />
      </div>
      <div className={`${styles.block} ${styles.side}`}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.line} />
        ))}
      </div>
      <div className={`${styles.block} ${styles.wide}`}>
        <div className={styles.row}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.chip} />
          ))}
        </div>
      </div>
    </div>
  );
}

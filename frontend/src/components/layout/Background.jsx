import styles from "./Background.module.css";

/**
 * Paisaje de montañas al atardecer en SVG (≈2 KB): reemplaza a la imagen
 * de fondo de 190 KB, escala sin pérdida y no bloquea la carga.
 */
export default function Background() {
  return (
    <div className={styles.background} aria-hidden="true">
      <svg
        className={styles.landscape}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="bc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#060d22" />
            <stop offset="0.45" stopColor="#0f1f4a" />
            <stop offset="0.72" stopColor="#3a3a6e" />
            <stop offset="0.86" stopColor="#c56b5a" />
            <stop offset="1" stopColor="#f2a65e" />
          </linearGradient>
          <radialGradient id="bc-glow" cx="0.72" cy="0.78" r="0.35">
            <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#bc-sky)" />
        <rect width="1440" height="900" fill="url(#bc-glow)" />
        <circle cx="1040" cy="690" r="46" fill="#ffd28a" opacity="0.9" />
        <path
          fill="#2b2f5e"
          d="M0 700 L140 600 L250 660 L400 540 L520 640 L640 570 L790 680 L930 590 L1060 660 L1200 560 L1330 640 L1440 590 V900 H0 Z"
        />
        <path
          fill="#1a2148"
          d="M0 760 L120 700 L260 760 L380 680 L540 770 L700 700 L850 780 L990 710 L1120 780 L1270 700 L1440 770 V900 H0 Z"
        />
        <path
          fill="#0c1430"
          d="M0 820 L160 780 L330 830 L520 790 L720 840 L900 800 L1100 845 L1280 805 L1440 835 V900 H0 Z"
        />
      </svg>
      <div className={styles.scrim} />
    </div>
  );
}

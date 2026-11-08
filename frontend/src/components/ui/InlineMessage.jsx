import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faTriangleExclamation,
  faCircleExclamation,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./InlineMessage.module.css";

const ICONS = {
  info: faCircleInfo,
  warning: faTriangleExclamation,
  error: faCircleExclamation,
  waking: faServer,
};

/**
 * Mensaje contextual no bloqueante (en lugar de modales).
 * Los errores se anuncian como `alert`; el resto, como `status` (polite).
 */
export default function InlineMessage({ tone = "info", title, children, action, onDismiss }) {
  return (
    <div className={`${styles.message} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      <FontAwesomeIcon icon={ICONS[tone]} className={styles.icon} aria-hidden="true" />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
      {(action || onDismiss) && (
        <div className={styles.actions}>
          {action}
          {onDismiss && (
            <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Cerrar aviso">
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}

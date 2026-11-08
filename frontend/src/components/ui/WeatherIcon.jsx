import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { weatherIcon } from "../../domain/weatherIcons";
import styles from "./WeatherIcon.module.css";

/**
 * Ícono meteorológico. Si `label` está presente se anuncia a lectores de
 * pantalla; si no, es decorativo (la descripción ya está en el texto).
 */
export default function WeatherIcon({ iconKey, label, size = "md", className = "" }) {
  const { icon, tone } = weatherIcon(iconKey);
  return (
    <span
      className={`${styles.icon} ${styles[tone]} ${styles[size]} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}

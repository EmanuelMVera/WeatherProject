import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Card.module.css";

/**
 * Sección con encabezado accesible (aria-labelledby).
 * @param {{ title: string, icon?: object, id?: string, actions?: React.ReactNode,
 *           className?: string, subtitle?: React.ReactNode, children: React.ReactNode }} props
 */
export default function Card({ title, icon, id, actions, className = "", subtitle, children }) {
  const headingId = useId();
  return (
    <section id={id} className={`${styles.card} ${className}`} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div>
          <h2 id={headingId} className={styles.title}>
            {icon && <FontAwesomeIcon icon={icon} className={styles.icon} aria-hidden="true" />}
            {title}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

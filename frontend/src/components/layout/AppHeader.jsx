import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faStar, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import Logo from "./Logo";
import styles from "./AppHeader.module.css";

const NAV_ITEMS = [
  { href: "#ahora", label: "Clima", icon: faHouse, current: true },
  { href: "#favoritos", label: "Favoritos", icon: faStar },
  { href: "#acerca", label: "Acerca de Buen Clima", icon: faCircleInfo },
];

/**
 * Encabezado compacto. La navegación aparece desde tablet; en el celular
 * se recorre la página con scroll y el buscador queda a mano.
 */
export default function AppHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.brand} href="#ahora" aria-label="Buen Clima, ir al clima actual">
        <Logo size={40} />
        <span className={styles.name}>
          Buen <span className={styles.accent}>Clima</span>
        </span>
      </a>
      <span className={styles.divider} aria-hidden="true" />
      <p className={styles.tagline}>Tu pronóstico, claro y sin vueltas.</p>
      <nav className={styles.nav} aria-label="Principal">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={item.current ? styles.current : undefined}
                aria-current={item.current ? "page" : undefined}
              >
                <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

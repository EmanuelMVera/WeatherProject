import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import styles from "./FavoritesBar.module.css";

/**
 * Accesos rápidos a localidades guardadas. Se desplaza horizontalmente si
 * no entran; la página sigue con scroll vertical normal.
 */
export default function FavoritesBar({ favorites, activeId, addable, onAdd, onSelect, onRemove }) {
  return (
    <section id="favoritos" className={styles.bar} aria-label="Localidades favoritas">
      <p className={styles.label}>
        <FontAwesomeIcon icon={faStar} className={styles.star} aria-hidden="true" />
        Favoritos:
      </p>
      <ul className={styles.list}>
        {favorites.map((place) => {
          const active = place.id === activeId;
          return (
            <li key={place.id} className={`${styles.chip} ${active ? styles.active : ""}`}>
              <button
                type="button"
                className={styles.select}
                onClick={() => onSelect(place)}
                aria-current={active ? "true" : undefined}
                title={[place.name, place.region, place.country].filter(Boolean).join(", ")}
              >
                <FontAwesomeIcon icon={active ? faStar : faStarOutline} className={styles.chipStar} aria-hidden="true" />
                {place.name}
              </button>
              <button
                type="button"
                className={styles.remove}
                onClick={() => onRemove(place.id)}
                aria-label={`Quitar ${place.name} de favoritos`}
              >
                <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
              </button>
            </li>
          );
        })}
        {addable && (
          <li>
            <button
              type="button"
              className={styles.add}
              onClick={onAdd}
              aria-label={`Agregar ${addable} a favoritos`}
            >
              <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
              Agregar
            </button>
          </li>
        )}
      </ul>
      {favorites.length === 0 && !addable && (
        <p className={styles.empty}>Buscá una ciudad y guardala para cambiar rápido.</p>
      )}
    </section>
  );
}

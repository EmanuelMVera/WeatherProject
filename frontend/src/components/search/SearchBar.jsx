import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs, faSpinner } from "@fortawesome/free-solid-svg-icons";
import LocationSearch from "./LocationSearch";
import InlineMessage from "../ui/InlineMessage";
import buttonStyles from "../ui/Button.module.css";
import styles from "./SearchBar.module.css";

/**
 * Buscador + botón "Usar mi ubicación". La ubicación sólo se pide cuando el
 * usuario toca el botón; el buscador manual siempre está disponible.
 */
export default function SearchBar({ onSelectPlace, onLocate, geoStatus, geoError, onDismissGeoError, showIntro }) {
  const locating = geoStatus === "locating";
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <LocationSearch onSelectPlace={onSelectPlace} />
        <button
          type="button"
          className={`${buttonStyles.button} ${styles.locate}`}
          onClick={onLocate}
          disabled={locating}
          aria-label="Usar mi ubicación"
          title="Usar mi ubicación"
        >
          <FontAwesomeIcon
            icon={locating ? faSpinner : faLocationCrosshairs}
            className={locating ? buttonStyles.spin : undefined}
            aria-hidden="true"
          />
          <span className={styles.locateText}>{locating ? "Ubicando…" : "Usar mi ubicación"}</span>
        </button>
      </div>

      {geoError && (
        <InlineMessage tone="warning" onDismiss={onDismissGeoError}>
          {geoError}
        </InlineMessage>
      )}

      {showIntro && !geoError && (
        <p className={styles.intro}>
          Te mostramos Buenos Aires. Buscá tu ciudad o tocá <strong>Usar mi ubicación</strong>: el
          navegador te va a pedir permiso y sólo usamos tu ubicación aproximada.
        </p>
      )}
    </div>
  );
}

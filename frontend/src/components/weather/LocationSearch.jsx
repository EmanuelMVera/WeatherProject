import React, { useCallback, useId, useRef } from "react";
import styles from "./LocationSearch.module.css";
import { useLocationSearch } from "../../hooks/useLocationSearch";
import { MIN_QUERY_LENGTH } from "../../services/geoClient";

/**
 * Buscador único predictivo de ubicaciones (autocomplete).
 * Al elegir un resultado entrega { name, latitude, longitude } ya normalizado.
 *
 * @param {{
 *   onSelectPlace: (place: { name: string, latitude: number, longitude: number }) => void,
 * }} props
 */
const LocationSearch = ({ onSelectPlace }) => {
  const {
    query,
    results,
    open,
    activeIndex,
    loading,
    error,
    onQueryChange,
    openList,
    closeList,
    moveActive,
    selectAt,
    clear,
  } = useLocationSearch();

  const listboxId = useId();
  const blurTimerRef = useRef(null);

  const commitSelection = useCallback(
    (index) => {
      const place = selectAt(index);
      if (!place) return;

      const name = String(place.name).trim().replace(/\s+/g, " ");
      const latitude = Number(place.latitude);
      const longitude = Number(place.longitude);
      if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return;
      }

      onSelectPlace?.({ name, latitude, longitude });
    },
    [selectAt, onSelectPlace]
  );

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveActive(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveActive(-1);
          break;
        case "Enter":
          if (open && activeIndex >= 0) {
            event.preventDefault();
            commitSelection(activeIndex);
          }
          break;
        case "Escape":
          closeList();
          break;
        default:
          break;
      }
    },
    [open, activeIndex, moveActive, commitSelection, closeList]
  );

  const handleBlur = useCallback(() => {
    // Retraso para permitir que el onMouseDown de una opción se procese primero.
    blurTimerRef.current = setTimeout(closeList, 150);
  }, [closeList]);

  const handleFocus = useCallback(() => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    openList();
  }, [openList]);

  const showList = open && (loading || error || results.length > 0 || query.trim().length >= MIN_QUERY_LENGTH);

  return (
    <section className={styles.container} aria-label="Buscador de ubicación">
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.input}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Buscá una ciudad o localidad (ej: Guernica, Córdoba)"
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-label="Buscar ubicación"
        />
        {query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clear}
            aria-label="Limpiar búsqueda"
          >
            &times;
          </button>
        )}

        {showList && (
          <ul className={styles.list} id={listboxId} role="listbox">
            {loading && (
              <li className={styles.hint} role="presentation">
                Buscando…
              </li>
            )}

            {!loading && error && (
              <li className={styles.hintError} role="alert">
                {error}
              </li>
            )}

            {!loading &&
              !error &&
              results.length === 0 &&
              query.trim().length >= MIN_QUERY_LENGTH && (
                <li className={styles.hint} role="presentation">
                  Sin resultados para «{query.trim()}»
                </li>
              )}

            {!loading &&
              !error &&
              results.map((place, index) => (
                <li
                  key={place.id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={
                    index === activeIndex
                      ? `${styles.option} ${styles.optionActive}`
                      : styles.option
                  }
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commitSelection(index);
                  }}
                >
                  <span className={styles.optionName}>{place.name}</span>
                  {(place.admin1 || place.country) && (
                    <span className={styles.optionMeta}>
                      {[place.admin1, place.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default React.memo(LocationSearch);

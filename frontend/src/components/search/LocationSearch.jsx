import { memo, useCallback, useEffect, useId, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useLocationSearch } from "../../hooks/useLocationSearch";
import { MAX_QUERY_LENGTH, MIN_QUERY_LENGTH } from "../../services/geoClient";
import styles from "./LocationSearch.module.css";

/**
 * Buscador predictivo de localidades (patrón combobox de ARIA APG).
 * @param {{ onSelectPlace: (place: import("../../services/geoClient").SearchResult) => void }} props
 */
const LocationSearch = memo(function LocationSearch({ onSelectPlace }) {
  const search = useLocationSearch();
  const { query, results, open, activeIndex, loading, error } = search;
  const listboxId = useId();
  const inputId = useId();
  const blurTimer = useRef(null);
  const listRef = useRef(null);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  // Mantener visible la opción activa al navegar con el teclado.
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex]);

  const commit = useCallback(
    (index) => {
      const place = search.selectAt(index);
      if (place) onSelectPlace(place);
    },
    [search, onSelectPlace]
  );

  const onKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        search.moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        search.moveActive(-1);
        break;
      case "Enter":
        if (open && activeIndex >= 0) {
          event.preventDefault();
          commit(activeIndex);
        }
        break;
      case "Escape":
        if (open) search.closeList();
        else search.clear();
        break;
      default:
        break;
    }
  };

  const term = query.trim();
  const showList = open && (loading || Boolean(error) || term.length >= MIN_QUERY_LENGTH);
  const noResults = !loading && !error && results.length === 0 && term.length >= MIN_QUERY_LENGTH;

  let liveText = "";
  if (showList && !loading) {
    if (error) liveText = error;
    else if (noResults) liveText = `Sin resultados para ${term}`;
    else if (results.length) liveText = `${results.length} resultados. Usá las flechas para elegir.`;
  }

  return (
    <div className={styles.search}>
      <label htmlFor={inputId} className="visually-hidden">
        Buscar una ciudad o localidad
      </label>
      <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} aria-hidden="true" />
      <input
        id={inputId}
        type="search"
        className={styles.input}
        value={query}
        maxLength={MAX_QUERY_LENGTH}
        placeholder="Buscá una ciudad o localidad"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={showList && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        onChange={(e) => search.onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => {
          clearTimeout(blurTimer.current);
          search.openList();
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(search.closeList, 150);
        }}
      />
      {query && (
        <button type="button" className={styles.clear} onClick={search.clear} aria-label="Borrar búsqueda">
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
        </button>
      )}

      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label="Localidades encontradas"
        className={styles.list}
        hidden={!showList}
      >
        {loading && (
          <li className={styles.hint} role="presentation">
            Buscando…
          </li>
        )}
        {!loading && error && (
          <li className={`${styles.hint} ${styles.hintError}`} role="presentation">
            {error}
          </li>
        )}
        {noResults && (
          <li className={styles.hint} role="presentation">
            No encontramos «{term}». Probá con otra grafía o agregá la provincia.
          </li>
        )}
        {!loading &&
          !error &&
          results.map((place, index) => (
            <li
              key={place.id}
              id={`${listboxId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={index === activeIndex}
              className={`${styles.option} ${index === activeIndex ? styles.active : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(index)}
            >
              <span className={styles.optionName}>{place.name}</span>
              <span className={styles.optionMeta}>
                {[place.detail, place.region, place.country].filter(Boolean).join(" · ")}
              </span>
            </li>
          ))}
      </ul>
      <p className="visually-hidden" aria-live="polite">
        {liveText}
      </p>
    </div>
  );
});

export default LocationSearch;

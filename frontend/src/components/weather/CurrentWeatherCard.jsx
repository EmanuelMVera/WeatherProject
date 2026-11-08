import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as faStarSolid,
  faLocationDot,
  faTemperatureHalf,
  faWind,
  faDroplet,
  faGaugeHigh,
  faCloud,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import WeatherIcon from "../ui/WeatherIcon";
import DataStatus from "./DataStatus";
import { formatKmh, formatLongDate, formatNumber, formatPercent, formatTemp, formatTime } from "../../lib/format";
import { placeSubtitle } from "../../domain/location";
import { windDescription, windDirection } from "../../domain/wind";
import styles from "./CurrentWeatherCard.module.css";

function Fact({ icon, label, children }) {
  return (
    <div className={styles.fact}>
      <dt>
        <FontAwesomeIcon icon={icon} aria-hidden="true" />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * Protagonista de la pantalla: responde "¿qué temperatura hace y cómo está?"
 * y reúne los detalles de las condiciones actuales.
 */
export default function CurrentWeatherCard({ place, data, today, isFavorite, canFavorite, onToggleFavorite, status }) {
  const { current, location, meta } = data;
  const tz = location.timezone;
  const subtitle = placeSubtitle(place);
  const dir = windDirection(current?.windDirection);
  const windText = windDescription(current?.windSpeed);

  return (
    <section id="ahora" className={styles.card} aria-labelledby="current-place">
      <div className={styles.top}>
        <FontAwesomeIcon icon={faLocationDot} className={styles.pin} aria-hidden="true" />
        <div className={styles.place}>
          <h2 id="current-place" className={styles.name}>
            {place.source === "geolocation" ? "Mi ubicación" : place.name}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {current && (
            <p className={styles.date}>
              {formatLongDate(current.local.date)} · {formatTime(current.time, tz)} h
            </p>
          )}
        </div>
        {canFavorite && (
          <button
            type="button"
            className={`${styles.favorite} ${isFavorite ? styles.favoriteOn : ""}`}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
            title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          >
            <FontAwesomeIcon icon={isFavorite ? faStarSolid : faStarOutline} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={styles.body}>
        {current ? (
          <div className={styles.main}>
            <WeatherIcon iconKey={current.condition.icon} size="lg" className={styles.icon} />
            <div>
              <p className={styles.temp}>
                <span className="visually-hidden">Temperatura actual: </span>
                {formatTemp(current.temperature)}
                <span className={styles.unit}>C</span>
              </p>
              <p className={styles.condition}>{current.condition.description}</p>
              {today && (
                <p className={styles.range}>
                  <span className={styles.max}>
                    <span className="visually-hidden">Máxima de hoy </span>↑ {formatTemp(today.temperatureMax)}
                  </span>
                  <span className={styles.min}>
                    <span className="visually-hidden">Mínima de hoy </span>↓ {formatTemp(today.temperatureMin)}
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className={styles.missing}>Las condiciones actuales no están disponibles en este momento.</p>
        )}

        {current && (
          <dl className={styles.facts} aria-label="Condiciones actuales en detalle">
            <Fact icon={faTemperatureHalf} label="Sensación térmica">
              {formatTemp(current.apparentTemperature)}
            </Fact>
            <Fact icon={faWind} label="Viento">
              {formatKmh(current.windSpeed)}
              {dir && (
                <span className={styles.dir} title={`Viento del ${dir.name}`}>
                  <FontAwesomeIcon
                    icon={faArrowUp}
                    style={{ transform: `rotate(${current.windDirection + 180}deg)` }}
                    aria-hidden="true"
                  />
                  {dir.short}
                  <span className="visually-hidden"> (del {dir.name})</span>
                </span>
              )}
            </Fact>
            <Fact icon={faWind} label="Ráfagas">
              {formatKmh(current.windGusts)}
            </Fact>
            <Fact icon={faDroplet} label="Humedad">
              {formatPercent(current.humidity)}
            </Fact>
            <Fact icon={faGaugeHigh} label="Presión">
              {current.pressure == null ? "—" : `${formatNumber(current.pressure)} hPa`}
            </Fact>
            <Fact icon={faCloud} label="Nubosidad">
              {formatPercent(current.cloudCover)}
            </Fact>
          </dl>
        )}
      </div>
      {windText && current?.windSpeed >= 29 && (
        <p className={styles.windNote}>Viento {windText.toLowerCase()} en este momento.</p>
      )}

      <DataStatus
        source={meta.source}
        observedAt={current?.time}
        timeZone={tz}
        timeZoneLabel={location.timezoneAbbreviation}
        fetchedAt={status.fetchedAt}
        stale={status.stale}
        loading={status.loading}
        onRefresh={status.onRefresh}
        now={status.now}
      />
    </section>
  );
}

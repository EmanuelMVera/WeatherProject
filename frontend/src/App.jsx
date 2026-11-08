import { useCallback, useEffect, useRef, useState } from "react";
import Background from "./components/layout/Background";
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import SearchBar from "./components/search/SearchBar";
import FavoritesBar from "./components/favorites/FavoritesBar";
import WeatherDashboard from "./components/weather/WeatherDashboard";
import DashboardSkeleton from "./components/ui/Skeleton";
import InlineMessage from "./components/ui/InlineMessage";
import ErrorBoundary from "./components/ErrorBoundary";
import buttonStyles from "./components/ui/Button.module.css";
import { useWeather, STALE_AFTER_MS } from "./hooks/useWeather";
import { useAlerts } from "./hooks/useAlerts";
import { useFavorites } from "./hooks/useFavorites";
import { useGeolocation } from "./hooks/useGeolocation";
import { useMediaQuery, useNow, useOnline } from "./hooks/useMediaQuery";
import { DEFAULT_PLACE, isValidPlace, toPlace } from "./domain/location";
import { readJson, STORAGE_KEYS, writeJson } from "./lib/storage";
import { formatRelativeTime, formatTemp } from "./lib/format";
import styles from "./App.module.css";

function loadInitialPlace() {
  const saved = readJson(STORAGE_KEYS.lastLocation, isValidPlace, null);
  return (saved && toPlace(saved)) || DEFAULT_PLACE;
}

export default function App() {
  const [place, setPlace] = useState(loadInitialPlace);
  const favorites = useFavorites();
  const geo = useGeolocation();
  const weather = useWeather(place);
  const alerts = useAlerts(place, weather.data?.location?.timezone, weather.fetchedAt);
  const isWide = useMediaQuery("(min-width: 720px)");
  const now = useNow(30_000);
  const online = useOnline();
  const canFavorite = place.source !== "geolocation";
  const isFavorite = favorites.isFavorite(place.id);
  const { reload: reloadWeather } = weather;

  // Al recuperar la conexión, actualizamos sin que el usuario tenga que hacer nada.
  const wasOnline = useRef(online);
  useEffect(() => {
    if (online && !wasOnline.current) reloadWeather();
    wasOnline.current = online;
  }, [online, reloadWeather]);

  useEffect(() => {
    if (place.source !== "default") writeJson(STORAGE_KEYS.lastLocation, place);
  }, [place]);

  // Título de la pestaña con el dato principal.
  useEffect(() => {
    const temp = weather.data?.current?.temperature;
    const name = place.source === "geolocation" ? "Mi ubicación" : place.name;
    document.title = temp != null ? `${formatTemp(temp)} ${name} · Buen Clima` : "Buen Clima · Tu pronóstico, claro y sin vueltas";
  }, [weather.data, place]);

  const selectPlace = useCallback((input, source) => {
    const next = toPlace(input, source);
    if (next) setPlace(next);
  }, []);

  const handleSearchSelect = useCallback((result) => selectPlace(result, "search"), [selectPlace]);
  const handleFavoriteSelect = useCallback((fav) => selectPlace(fav, "favorite"), [selectPlace]);

  const handleLocate = useCallback(async () => {
    const coords = await geo.locate();
    if (coords) selectPlace({ name: "Mi ubicación", ...coords }, "geolocation");
  }, [geo, selectPlace]);

  const { data, status, error, fetchedAt, wakingUp, fromPreviousSession, reload } = weather;
  const loading = status === "loading";
  const stale = Boolean(data) && (data.meta?.stale || (fetchedAt != null && now - fetchedAt > STALE_AFTER_MS));
  const retryButton = (
    <button type="button" className={`${buttonStyles.button} ${buttonStyles.primary}`} onClick={reload}>
      Reintentar
    </button>
  );

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Background />
      <div className={styles.shell}>
        <AppHeader />

        <div className={styles.toolbar}>
          <div className={styles.intro}>
            <h1 className={styles.title}>Clima actualizado y pronóstico</h1>
            <p className={styles.lead}>
              Consultá el clima actual, el pronóstico por horas y los próximos 7 días de forma simple y
              confiable.
            </p>
          </div>
          <div className={styles.tools}>
          <SearchBar
            onSelectPlace={handleSearchSelect}
            onLocate={handleLocate}
            geoStatus={geo.status}
            geoError={geo.errorMessage}
            onDismissGeoError={geo.dismissError}
            showIntro={place.source === "default"}
          />
          <FavoritesBar
            favorites={favorites.favorites}
            activeId={place.id}
            addable={canFavorite && !isFavorite && !favorites.isFull ? place.name : null}
            onAdd={() => favorites.addFavorite(place)}
            onSelect={handleFavoriteSelect}
            onRemove={favorites.removeFavorite}
          />
          {favorites.storageError && (
            <InlineMessage tone="warning">
              No pudimos guardar tus favoritos en este navegador (puede estar en modo privado).
            </InlineMessage>
          )}
          </div>
        </div>

        <main id="contenido" className={styles.main} tabIndex={-1}>
          <div className={styles.messages}>
            {!online && (
              <InlineMessage tone="warning" title="Sin conexión a Internet">
                {data
                  ? "Te mostramos los últimos datos guardados. Se actualizan solos cuando vuelva la conexión."
                  : "Cuando vuelva la conexión vas a poder consultar el pronóstico."}
              </InlineMessage>
            )}
            {loading && wakingUp && (
              <InlineMessage tone="waking" title="Estamos despertando al servidor">
                Usamos un servidor gratuito que se apaga cuando no hay visitas. La primera consulta puede
                tardar hasta un minuto; no hace falta recargar.
              </InlineMessage>
            )}
            {loading && fromPreviousSession && data && (
              <InlineMessage tone="info">
                Te mostramos los últimos datos guardados ({formatRelativeTime(fetchedAt, now)}) mientras
                los actualizamos.
              </InlineMessage>
            )}
            {status === "error" && !data && (
              <InlineMessage tone="error" title="No pudimos cargar el pronóstico" action={retryButton}>
                {error?.message} Podés reintentar o buscar otra localidad.
              </InlineMessage>
            )}
            {status === "error" && data && (
              <InlineMessage tone="warning" title="No pudimos actualizar los datos" action={retryButton}>
                {error?.message} Te mostramos la última información disponible ({formatRelativeTime(fetchedAt, now)}).
              </InlineMessage>
            )}
          </div>

          {data ? (
            <ErrorBoundary
              resetKeys={[data]}
              fallback={
                <InlineMessage tone="error" title="No pudimos mostrar este pronóstico" action={retryButton}>
                  Algo falló al mostrar los datos. Probá de nuevo o elegí otra localidad.
                </InlineMessage>
              }
            >
              <WeatherDashboard
                place={place}
                data={data}
                now={now}
                isWide={isWide}
                alerts={alerts}
                favorite={{
                  isFavorite,
                  canFavorite,
                  onToggle: () => favorites.toggleFavorite(place),
                }}
                status={{ fetchedAt, stale, loading, onRefresh: reload, now }}
              />
            </ErrorBoundary>
          ) : (
            loading && (
              <>
                <p className="visually-hidden" role="status">
                  Cargando el pronóstico de {place.name}…
                </p>
                <DashboardSkeleton />
              </>
            )
          )}
        </main>

        <AppFooter />
      </div>
    </>
  );
}

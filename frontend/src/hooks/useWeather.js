import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWeather } from "../services/weatherClient.js";
import { COLD_START_HINT_MS } from "../services/http.js";
import { readJson, STORAGE_KEYS, writeJson } from "../lib/storage.js";

/** Tiempo durante el cual reutilizamos datos ya descargados en esta sesión. */
const SESSION_FRESH_MS = 10 * 60 * 1000;
/** A partir de esta antigüedad marcamos los datos como desactualizados. */
export const STALE_AFTER_MS = 45 * 60 * 1000;
/** Antigüedad máxima de datos persistidos que vale la pena mostrar al abrir. */
const PERSISTED_MAX_AGE_MS = 12 * 60 * 60 * 1000;
/** Al volver a la pestaña, refrescamos si los datos tienen más de esto. */
const REFRESH_ON_FOCUS_MS = 15 * 60 * 1000;

const sessionCache = new Map();

/** Sólo para tests. */
export function clearWeatherSessionCache() {
  sessionCache.clear();
}

/** Cantidad de localidades cuyo último pronóstico se guarda (uso sin conexión). */
const PERSISTED_PLACES = 6;

const isEntry = (v) => v && typeof v.placeId === "string" && typeof v.fetchedAt === "number" && v.data?.location;

function readAllPersisted() {
  const list = readJson(STORAGE_KEYS.lastWeather, Array.isArray, []);
  return list.filter(isEntry);
}

function readPersisted(placeId) {
  const saved = readAllPersisted().find((entry) => entry.placeId === placeId);
  if (!saved) return null;
  if (Date.now() - saved.fetchedAt > PERSISTED_MAX_AGE_MS) return null;
  return saved;
}

function writePersisted(entry) {
  const others = readAllPersisted().filter((e) => e.placeId !== entry.placeId);
  const next = [entry, ...others].slice(0, PERSISTED_PLACES);
  // Si no hay espacio, intentamos guardar al menos la localidad actual.
  if (!writeJson(STORAGE_KEYS.lastWeather, next)) writeJson(STORAGE_KEYS.lastWeather, [entry]);
}

function initialState(place) {
  const persisted = place ? readPersisted(place.id) : null;
  return {
    placeId: place?.id ?? null,
    data: persisted?.data ?? null,
    fetchedAt: persisted?.fetchedAt ?? null,
    fromPreviousSession: Boolean(persisted),
    status: place ? "loading" : "idle",
    error: null,
    wakingUp: false,
  };
}

/**
 * Pronóstico para una localidad, con:
 * - cancelación al cambiar de localidad (respuestas viejas nunca pisan nuevas),
 * - caché de sesión para alternar entre favoritos al instante,
 * - últimos datos persistidos para mostrar algo útil mientras el servidor arranca,
 * - aviso de "servidor iniciándose" y recarga manual / al volver a la pestaña.
 *
 * @param {import("../domain/location.js").Place | null} place
 */
export function useWeather(place) {
  const [state, setState] = useState(() => initialState(place));
  const [reloadToken, setReloadToken] = useState(0);
  const forceRef = useRef(false);
  const fetchedAtRef = useRef(state.fetchedAt);
  fetchedAtRef.current = state.fetchedAt;

  const placeId = place?.id ?? null;
  const latitude = place?.latitude;
  const longitude = place?.longitude;

  useEffect(() => {
    if (!placeId) return undefined;

    const force = forceRef.current;
    forceRef.current = false;

    const cached = sessionCache.get(placeId);
    if (!force && cached && Date.now() - cached.fetchedAt < SESSION_FRESH_MS) {
      setState({
        placeId,
        data: cached.data,
        fetchedAt: cached.fetchedAt,
        fromPreviousSession: false,
        status: "success",
        error: null,
        wakingUp: false,
      });
      return undefined;
    }

    const controller = new AbortController();
    setState((prev) => {
      if (prev.placeId === placeId) return { ...prev, status: "loading", error: null, wakingUp: false };
      const persisted = readPersisted(placeId);
      return {
        placeId,
        data: cached?.data ?? persisted?.data ?? null,
        fetchedAt: cached?.fetchedAt ?? persisted?.fetchedAt ?? null,
        fromPreviousSession: !cached && Boolean(persisted),
        status: "loading",
        error: null,
        wakingUp: false,
      };
    });

    const markWaking = () => {
      if (!controller.signal.aborted) setState((prev) => (prev.wakingUp ? prev : { ...prev, wakingUp: true }));
    };
    const wakingTimer = setTimeout(markWaking, COLD_START_HINT_MS);

    fetchWeather({ latitude, longitude }, { signal: controller.signal, onWakingUp: markWaking })
      .then((data) => {
        if (controller.signal.aborted) return;
        const fetchedAt = Date.now();
        sessionCache.set(placeId, { data, fetchedAt });
        writePersisted({ placeId, fetchedAt, data });
        setState({
          placeId,
          data,
          fetchedAt,
          fromPreviousSession: false,
          status: "success",
          error: null,
          wakingUp: false,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === "AbortError") return;
        setState((prev) => ({ ...prev, status: "error", error, wakingUp: false }));
      })
      .finally(() => clearTimeout(wakingTimer));

    return () => {
      controller.abort();
      clearTimeout(wakingTimer);
    };
  }, [placeId, latitude, longitude, reloadToken]);

  const reload = useCallback(() => {
    forceRef.current = true;
    setReloadToken((t) => t + 1);
  }, []);

  // Al volver a la pestaña después de un rato, actualizamos solos.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const fetchedAt = fetchedAtRef.current;
      if (fetchedAt && Date.now() - fetchedAt > REFRESH_ON_FOCUS_MS) reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  // Si el estado todavía corresponde a otra localidad, no lo exponemos.
  const matches = state.placeId === placeId;
  return {
    data: matches ? state.data : null,
    fetchedAt: matches ? state.fetchedAt : null,
    fromPreviousSession: matches && state.fromPreviousSession,
    status: matches ? state.status : "loading",
    error: matches ? state.error : null,
    wakingUp: matches && state.wakingUp,
    reload,
  };
}

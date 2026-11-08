import { fetchWithTimeout, friendlyMessage } from "./http.js";
import { placeId } from "../domain/location.js";

/**
 * Búsqueda de localidades con la Geocoding API de Open-Meteo (datos de
 * GeoNames). Se consulta directo desde el navegador: no requiere API key,
 * tiene CORS habilitado y así la búsqueda funciona aunque el backend esté
 * iniciándose.
 * https://open-meteo.com/en/docs/geocoding-api
 */

const GEO_BASE_URL = "https://geocoding-api.open-meteo.com/v1";
const REQUEST_TIMEOUT_MS = 8000;
export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 100;

/**
 * @typedef {import("../domain/location.js").Place & { detail?: string, label: string }} SearchResult
 */

/** @returns {SearchResult|null} */
export function toSearchResult(raw) {
  if (!raw || raw.name == null) return null;
  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const clean = (v) => (v ? String(v).trim() : undefined) || undefined;
  const name = String(raw.name).trim();
  const region = clean(raw.admin1);
  const country = clean(raw.country);
  // admin2 (partido/departamento) ayuda a distinguir localidades homónimas.
  const detail = clean(raw.admin2) !== name ? clean(raw.admin2) : undefined;

  return {
    id: placeId(latitude, longitude),
    name,
    region,
    detail,
    country,
    countryCode: clean(raw.country_code),
    latitude,
    longitude,
    label: [name, region, country].filter(Boolean).join(", "),
  };
}

/**
 * @param {string} query
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<SearchResult[]>}
 */
export async function searchPlaces(query, { signal } = {}) {
  const term = String(query ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  if (term.length < MIN_QUERY_LENGTH) return [];

  const params = new URLSearchParams({ name: term, count: "10", language: "es", format: "json" });

  let response;
  try {
    response = await fetchWithTimeout(`${GEO_BASE_URL}/search?${params}`, REQUEST_TIMEOUT_MS, { signal });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new Error(friendlyMessage(err));
  }
  if (!response.ok) throw new Error("La búsqueda de localidades no está disponible. Probá de nuevo.");

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Recibimos una respuesta inválida del buscador.");
  }

  const seen = new Set();
  return (Array.isArray(data?.results) ? data.results : [])
    .map(toSearchResult)
    .filter((place) => place && !seen.has(place.id) && seen.add(place.id));
}

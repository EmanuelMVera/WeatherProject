import { fetchWithTimeout, friendlyMessage } from "../utils/http.js";

/**
 * Cliente de la API de geocoding de Open-Meteo.
 * https://open-meteo.com/en/docs/geocoding-api
 *
 * Gratis, sin API key, con CORS habilitado y soporte de acentos/eñes.
 */

const GEO_BASE_URL = "https://geocoding-api.open-meteo.com/v1";
const REQUEST_TIMEOUT_MS = 8000;

// Mínimo de caracteres antes de consultar la API.
export const MIN_QUERY_LENGTH = 2;

/**
 * @typedef {Object} Place
 * @property {string|number} id
 * @property {string} name          Nombre de la localidad (ej: "Guernica").
 * @property {string} [admin1]      Provincia/estado (ej: "Buenos Aires").
 * @property {string} [country]     País (ej: "Argentina").
 * @property {string} [countryCode] ISO2 (ej: "AR").
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} label         Texto para mostrar: "Guernica, Buenos Aires, Argentina".
 */

/**
 * Convierte un resultado crudo de Open-Meteo en un `Place` normalizado.
 * @param {Record<string, unknown>} raw
 * @returns {Place | null}
 */
function toPlace(raw) {
  if (!raw || raw.name == null) return null;

  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const name = String(raw.name).trim();
  const admin1 = raw.admin1 ? String(raw.admin1).trim() : "";
  const country = raw.country ? String(raw.country).trim() : "";

  const label = [name, admin1, country].filter(Boolean).join(", ");

  return {
    id: raw.id ?? `${latitude},${longitude}`,
    name,
    admin1: admin1 || undefined,
    country: country || undefined,
    countryCode: raw.country_code ? String(raw.country_code) : undefined,
    latitude,
    longitude,
    label,
  };
}

/**
 * Busca localidades por texto libre.
 * @param {string} query
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<Place[]>}
 */
export async function searchPlaces(query, opts = {}) {
  const term = String(query ?? "").trim();
  if (term.length < MIN_QUERY_LENGTH) return [];

  const url = `${GEO_BASE_URL}/search?name=${encodeURIComponent(
    term
  )}&count=8&language=es&format=json`;

  let response;
  try {
    response = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS, {
      signal: opts.signal,
    });
  } catch (err) {
    // Cancelación pedida por el caller: propagar sin traducir a error visible.
    if (opts.signal?.aborted) throw err;
    throw new Error(friendlyMessage(err));
  }

  if (!response.ok) {
    throw new Error("No se pudo completar la búsqueda de ubicaciones.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Respuesta inválida del servicio de ubicaciones.");
  }

  const results = Array.isArray(data?.results) ? data.results : [];
  return results.map(toPlace).filter(Boolean);
}

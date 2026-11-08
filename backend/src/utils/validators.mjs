import { ValidationError } from "../errors.mjs";

// Número decimal simple: sin exponentes, hex, espacios ni valores vacíos.
const DECIMAL_RE = /^-?\d{1,3}(\.\d{1,8})?$/;

function parseCoordinate(raw, name, limit) {
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new ValidationError(`Falta el parámetro "${name}".`);
  }
  const value = raw.trim();
  if (!DECIMAL_RE.test(value)) {
    throw new ValidationError(`El parámetro "${name}" debe ser un número decimal.`);
  }
  const parsed = Number(value);
  if (parsed < -limit || parsed > limit) {
    throw new ValidationError(`El parámetro "${name}" está fuera de rango (±${limit}).`);
  }
  return parsed;
}

/**
 * Valida `lat` y `lon` de la query string.
 * @param {Record<string, unknown>} query
 * @returns {{ lat: number, lon: number }}
 */
export function parseCoordinates(query = {}) {
  return {
    lat: parseCoordinate(query.lat, "lat", 90),
    lon: parseCoordinate(query.lon, "lon", 180),
  };
}

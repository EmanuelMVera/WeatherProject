/**
 * Acceso seguro a localStorage: nunca lanza (modo privado, cuota llena,
 * almacenamiento bloqueado) y valida lo que lee antes de devolverlo.
 */

export function readJson(key, validate, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** @returns {boolean} true si se pudo guardar */
export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* sin almacenamiento disponible: nada que limpiar */
  }
}

export const STORAGE_KEYS = Object.freeze({
  favorites: "buenclima:favorites:v1",
  lastLocation: "buenclima:last-location:v1",
  lastWeather: "buenclima:weather-cache:v2",
});

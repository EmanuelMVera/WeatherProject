/**
 * Modelo de localidad que usa toda la app (búsqueda, favoritos, ubicación).
 * @typedef {Object} Place
 * @property {string} id          Clave estable derivada de las coordenadas.
 * @property {string} name        "Guernica"
 * @property {string} [region]    "Buenos Aires"
 * @property {string} [country]   "Argentina"
 * @property {string} [countryCode] "AR"
 * @property {number} latitude
 * @property {number} longitude
 * @property {"search"|"geolocation"|"favorite"|"default"} [source]
 */

export const DEFAULT_PLACE = Object.freeze({
  id: "-34.613,-58.377",
  name: "Buenos Aires",
  region: "Ciudad Autónoma de Buenos Aires",
  country: "Argentina",
  countryCode: "AR",
  latitude: -34.6131,
  longitude: -58.3772,
  source: "default",
});

export function placeId(latitude, longitude) {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
}

const isCoord = (v, limit) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= limit;

/** Valida una localidad leída de almacenamiento o recibida de afuera. */
export function isValidPlace(value) {
  return (
    value != null &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    value.name.length <= 120 &&
    isCoord(value.latitude, 90) &&
    isCoord(value.longitude, 180)
  );
}

/** Normaliza datos parciales a un Place completo (o null si no son válidos). */
export function toPlace(input, source) {
  if (!isValidPlace(input)) return null;
  const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  return {
    id: placeId(input.latitude, input.longitude),
    name: input.name.trim().replace(/\s+/g, " "),
    region: clean(input.region),
    country: clean(input.country),
    countryCode: clean(input.countryCode),
    latitude: input.latitude,
    longitude: input.longitude,
    source: source ?? input.source,
  };
}

/** "Buenos Aires, Argentina" / "Mi ubicación" */
export function placeSubtitle(place) {
  if (!place) return "";
  if (place.source === "geolocation") return "Ubicación aproximada de tu dispositivo";
  return [place.region !== place.name ? place.region : null, place.country].filter(Boolean).join(", ");
}

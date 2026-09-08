/**
 * Clave de caché estable para una petición de clima, tolerante a que venga
 * por nombre de ciudad (`city`) o por coordenadas (`lat`/`lon`).
 * @param {{ city?: string, lat?: string, lon?: string }} query
 * @returns {string}
 */
export const weatherCacheKey = ({ city, lat, lon } = {}) => {
  if (lat != null && lon != null) {
    return `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
  }
  if (city) return city.trim().toLowerCase();
  return "unknown";
};

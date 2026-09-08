export const validateCity = (city) => {
  if (!city || typeof city !== 'string') {
    return { valid: false, error: 'Ciudad no proporcionada o inválida' };
  }
  const trimmed = city.trim();
  if (trimmed.length === 0 || trimmed.length > 100) {
    return { valid: false, error: 'Nombre de ciudad demasiado largo o vacío' };
  }
  // Permite letras Unicode (con tildes / eñes), marcas de acento, espacios,
  // puntos, comas, guiones y apóstrofes. Ej válidos: "Presidente Perón",
  // "Córdoba", "Río Gallegos", "Comodoro Rivadavia".
  if (!/^[\p{L}\p{M}\s.,'’\-]+$/u.test(trimmed)) {
    return { valid: false, error: 'Nombre de ciudad contiene caracteres inválidos' };
  }
  return { valid: true, city: trimmed };
};

/**
 * Valida coordenadas geográficas provenientes de la query string.
 * @param {{ lat?: string|number, lon?: string|number }} query
 * @returns {{ valid: boolean, lat?: number, lon?: number, error?: string }}
 */
export const validateCoords = ({ lat, lon } = {}) => {
  const parsedLat = Number(lat);
  const parsedLon = Number(lon);

  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
    return { valid: false, error: 'Coordenadas inválidas' };
  }
  if (parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
    return { valid: false, error: 'Coordenadas fuera de rango' };
  }

  return { valid: true, lat: parsedLat, lon: parsedLon };
};

/**
 * Resuelve la ubicación pedida desde la query string: prioriza `lat`/`lon`;
 * si no vienen, cae a `city`.
 * @param {{ city?: string, lat?: string, lon?: string }} query
 * @returns {{ valid: boolean, location?: object, label?: string, error?: string }}
 */
export const resolveWeatherLocation = (query = {}) => {
  const hasCoords = query.lat != null && query.lon != null;
  const hasCity = query.city != null && query.city !== '';

  if (hasCoords) {
    const coords = validateCoords(query);
    if (!coords.valid) return { valid: false, error: coords.error };
    return {
      valid: true,
      location: { lat: coords.lat, lon: coords.lon },
      label: `${coords.lat},${coords.lon}`,
    };
  }

  if (hasCity) {
    const city = validateCity(query.city);
    if (!city.valid) return { valid: false, error: city.error };
    return { valid: true, location: { city: city.city }, label: city.city };
  }

  return { valid: false, error: 'Falta ciudad o coordenadas' };
};

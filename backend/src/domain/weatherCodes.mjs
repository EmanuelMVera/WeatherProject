/**
 * Códigos meteorológicos WMO (los que usa Open-Meteo en `weather_code`)
 * traducidos a descripciones en español rioplatense y a una clave de ícono
 * estable que el frontend sabe dibujar.
 *
 * Referencia: https://open-meteo.com/en/docs (sección "WMO Weather interpretation codes").
 */

/** @type {Record<number, { description: string, icon: string, dayNight?: boolean }>} */
const WMO_CODES = {
  0: { description: "Despejado", icon: "clear", dayNight: true },
  1: { description: "Mayormente despejado", icon: "mostly-clear", dayNight: true },
  2: { description: "Parcialmente nublado", icon: "partly-cloudy", dayNight: true },
  3: { description: "Nublado", icon: "overcast" },
  45: { description: "Niebla", icon: "fog" },
  48: { description: "Niebla con escarcha", icon: "fog" },
  51: { description: "Llovizna débil", icon: "drizzle" },
  53: { description: "Llovizna moderada", icon: "drizzle" },
  55: { description: "Llovizna intensa", icon: "drizzle" },
  56: { description: "Llovizna helada débil", icon: "freezing-rain" },
  57: { description: "Llovizna helada intensa", icon: "freezing-rain" },
  61: { description: "Lluvia débil", icon: "rain" },
  63: { description: "Lluvia moderada", icon: "rain" },
  65: { description: "Lluvia fuerte", icon: "heavy-rain" },
  66: { description: "Lluvia helada débil", icon: "freezing-rain" },
  67: { description: "Lluvia helada fuerte", icon: "freezing-rain" },
  71: { description: "Nevada débil", icon: "snow" },
  73: { description: "Nevada moderada", icon: "snow" },
  75: { description: "Nevada fuerte", icon: "snow" },
  77: { description: "Granos de nieve", icon: "snow" },
  80: { description: "Chaparrones débiles", icon: "showers", dayNight: true },
  81: { description: "Chaparrones moderados", icon: "showers", dayNight: true },
  82: { description: "Chaparrones violentos", icon: "heavy-rain" },
  85: { description: "Chaparrones de nieve débiles", icon: "snow" },
  86: { description: "Chaparrones de nieve fuertes", icon: "snow" },
  95: { description: "Tormenta", icon: "thunderstorm" },
  96: { description: "Tormenta con granizo débil", icon: "thunderstorm" },
  99: { description: "Tormenta con granizo fuerte", icon: "thunderstorm" },
};

/**
 * @param {number|null} code
 * @param {boolean|null} [isDay=true]  `null` (desconocido) se trata como día.
 * @returns {{ code: number|null, description: string, icon: string }}
 */
export function describeWeatherCode(code, isDay = true) {
  const entry = code == null ? undefined : WMO_CODES[code];
  if (!entry) {
    return { code: code ?? null, description: "Condición no disponible", icon: "unknown" };
  }
  const icon = entry.dayNight ? `${entry.icon}-${isDay === false ? "night" : "day"}` : entry.icon;
  return { code, description: entry.description, icon };
}

export const THUNDERSTORM_CODES = new Set([95, 96, 99]);

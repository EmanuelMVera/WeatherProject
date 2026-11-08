import { normalizeOpenMeteoForecast } from "../adapters/openMeteoAdapter.mjs";

export const WEATHER_SOURCE = Object.freeze({
  name: "Open-Meteo",
  url: "https://open-meteo.com/",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
});

/**
 * Redondea coordenadas a 2 decimales (~1 km). Es más fino que la grilla de
 * los modelos, mejora la tasa de aciertos de caché y evita enviar la
 * ubicación exacta del usuario al proveedor.
 */
export function roundCoord(value) {
  return Math.round(value * 100) / 100;
}

/**
 * @param {{ provider: { getForecast: Function }, cache: import("../lib/ttlCache.mjs").TtlCache, now?: () => number }} deps
 */
export function createWeatherService({ provider, cache, now = Date.now }) {
  return {
    /**
     * @param {{ lat: number, lon: number }} coords
     */
    async getWeather({ lat, lon }) {
      const coords = { lat: roundCoord(lat), lon: roundCoord(lon) };
      const key = `weather:${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`;

      const result = await cache.getOrLoad(key, async () => {
        const raw = await provider.getForecast(coords);
        return normalizeOpenMeteoForecast(raw, { now: now() });
      });

      const data = result.value;
      // Si servimos desde caché, descartamos horas que ya pasaron.
      const nowMs = now();
      const hourly = data.hourly.filter((h) => Date.parse(h.time) + 3600_000 > nowMs);

      return {
        ...data,
        hourly,
        meta: {
          source: WEATHER_SOURCE,
          // Momento en que el servidor obtuvo los datos del proveedor
          // (no es la hora de observación: esa es `current.time`).
          fetchedAt: new Date(result.storedAt).toISOString(),
          stale: result.status === "STALE",
          cache: result.status,
          requestedCoordinates: coords,
        },
      };
    },
  };
}

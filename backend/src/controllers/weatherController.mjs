import { parseCoordinates } from "../utils/validators.mjs";

/**
 * @param {{ weatherService: ReturnType<typeof import("../services/weatherService.mjs").createWeatherService> }} deps
 */
export function createWeatherController({ weatherService }) {
  return async function getWeather(req, res, next) {
    try {
      const coords = parseCoordinates(req.query);
      const body = await weatherService.getWeather(coords);
      // Datos públicos por coordenada: se pueden cachear en navegador/CDN un rato.
      res.set("Cache-Control", body.meta.stale ? "no-store" : "public, max-age=300");
      res.json(body);
    } catch (err) {
      next(err);
    }
  };
}

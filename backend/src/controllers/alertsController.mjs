import { parseCoordinates } from "../utils/validators.mjs";

/**
 * @param {{ alertsService: ReturnType<typeof import("../services/alertsService.mjs").createAlertsService> }} deps
 */
export function createAlertsController({ alertsService }) {
  return async function getAlerts(req, res, next) {
    try {
      const coords = parseCoordinates(req.query);
      const body = await alertsService.getAlerts(coords);
      res.set("Cache-Control", "public, max-age=120");
      res.json(body);
    } catch (err) {
      next(err);
    }
  };
}

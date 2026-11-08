import express from "express";
import rateLimit from "express-rate-limit";
import { createWeatherController } from "../controllers/weatherController.mjs";
import { createAlertsController } from "../controllers/alertsController.mjs";

/**
 * Rutas de la API (montadas bajo /api).
 * @param {{ weatherService: object, alertsService: object, rateLimit: { windowMs: number, max: number } }} deps
 */
export function createApiRouter({ weatherService, alertsService, rateLimit: limits }) {
  const router = express.Router();

  router.use(
    rateLimit({
      windowMs: limits.windowMs,
      limit: limits.max,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
          error: {
            code: "RATE_LIMITED",
            message: "Hiciste demasiadas consultas seguidas. Esperá unos minutos y volvé a intentar.",
          },
        });
      },
    })
  );

  router.get("/weather", createWeatherController({ weatherService }));
  router.get("/alerts", createAlertsController({ alertsService }));

  return router;
}

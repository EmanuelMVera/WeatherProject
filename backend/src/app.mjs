import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createApiRouter } from "./routes/index.mjs";
import { createErrorHandler, notFoundHandler } from "./middleware/errorHandler.mjs";
import { requestLogger } from "./middleware/requestLogger.mjs";

/**
 * Crea la app Express con sus dependencias inyectadas (facilita los tests:
 * se pueden pasar servicios con proveedores simulados).
 *
 * @param {{
 *   config: ReturnType<typeof import("./config/env.mjs").loadConfig>["config"],
 *   weatherService: object,
 *   alertsService: object,
 *   logger?: Console,
 * }} deps
 */
export function createApp({ config, weatherService, alertsService, logger = console }) {
  const app = express();

  app.disable("x-powered-by");
  // Detrás del proxy de Render: necesario para que el rate limit use la IP real.
  app.set("trust proxy", config.trustProxy);
  // Parser simple: `?lat[]=1` no se convierte en objetos/arrays.
  app.set("query parser", "simple");

  // API JSON pura: sin HTML, así que la CSP más estricta posible.
  app.use(
    helmet({
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(compression());
  if (config.nodeEnv !== "test") app.use(requestLogger({ logger }));

  app.use(
    cors({
      origin(origin, callback) {
        // Sin Origin (curl, health checks): se permite; el navegador no lo usa.
        if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true);
        // Origen no permitido: respondemos sin cabeceras CORS (el navegador bloquea).
        return callback(null, false);
      },
      methods: ["GET", "HEAD", "OPTIONS"],
      maxAge: 86400,
    })
  );

  // Health check fuera del rate limit: el frontend lo usa para "despertar"
  // el plan gratuito de Render sin consumir cuota.
  app.get(["/health", "/healthz"], (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ status: "ok" });
  });

  app.use(
    "/api",
    createApiRouter({ weatherService, alertsService, rateLimit: config.rateLimit })
  );

  app.use(notFoundHandler);
  app.use(createErrorHandler({ isProduction: config.isProduction, logger }));

  return app;
}

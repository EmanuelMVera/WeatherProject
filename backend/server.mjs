import "dotenv/config";
import { loadConfig } from "./src/config/env.mjs";
import { createApp } from "./src/app.mjs";
import { TtlCache } from "./src/lib/ttlCache.mjs";
import { createOpenMeteoProvider } from "./src/providers/openMeteo.mjs";
import { createSmnAlertsProvider } from "./src/providers/smnAlerts.mjs";
import { createWeatherService } from "./src/services/weatherService.mjs";
import { createAlertsService } from "./src/services/alertsService.mjs";

let loaded;
try {
  loaded = loadConfig(process.env);
} catch (err) {
  console.error(`[config] ${err.message}`);
  process.exit(1);
}
const { config, warnings } = loaded;
warnings.forEach((warning) => console.warn(`[config] ${warning}`));

const weatherService = createWeatherService({
  provider: createOpenMeteoProvider({
    baseUrl: config.openMeteo.baseUrl,
    apiKey: config.openMeteo.apiKey,
    timeoutMs: config.upstreamTimeoutMs,
  }),
  cache: new TtlCache({
    ttlMs: config.cache.weatherTtlMs,
    staleTtlMs: config.cache.staleTtlMs,
    maxEntries: config.cache.maxEntries,
  }),
});

const alertsService = createAlertsService({
  provider: createSmnAlertsProvider({ timeoutMs: config.upstreamTimeoutMs }),
  cache: new TtlCache({
    ttlMs: config.cache.alertsTtlMs,
    staleTtlMs: config.cache.staleTtlMs,
    maxEntries: 1,
  }),
});

const app = createApp({ config, weatherService, alertsService });

const server = app.listen(config.port, () => {
  console.log(`Buen Clima API escuchando en el puerto ${config.port} (${config.nodeEnv})`);
});

server.on("error", (err) => {
  console.error("[server]", err.message);
  process.exit(1);
});

function shutdown(signal) {
  console.log(`${signal} recibido: cerrando servidor…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

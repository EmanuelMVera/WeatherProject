import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.mjs";
import { loadConfig } from "../src/config/env.mjs";
import { TtlCache } from "../src/lib/ttlCache.mjs";
import { createWeatherService } from "../src/services/weatherService.mjs";
import { createAlertsService } from "../src/services/alertsService.mjs";
import { UpstreamError, UpstreamTimeoutError } from "../src/errors.mjs";
import { FIXTURE_NOW, loadJsonFixture, silentLogger } from "./helpers.mjs";

const raw = loadJsonFixture("open-meteo-buenos-aires.json");

/** Levanta la app en un puerto efímero y devuelve helpers de request. */
async function startServer({ provider, rateMax = 100, now = () => FIXTURE_NOW, cacheClock = now } = {}) {
  const { config: base } = loadConfig({ NODE_ENV: "test", ALLOWED_ORIGINS: "https://buenclima.example" });
  const config = { ...base, rateLimit: { windowMs: 60_000, max: rateMax } };
  const weatherService = createWeatherService({
    provider,
    cache: new TtlCache({ ttlMs: 1000, staleTtlMs: 60_000, now: cacheClock }),
    now,
  });
  const alertsService = createAlertsService({
    provider: { getActiveAlerts: async () => ({ alerts: [], partial: false }) },
    cache: new TtlCache({ ttlMs: 1000 }),
    now,
  });
  const app = createApp({ config, weatherService, alertsService, logger: silentLogger });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return {
    get: (path, headers = {}) => fetch(`${baseUrl}${path}`, { headers }),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

describe("API /api/weather", () => {
  let srv;
  let calls = 0;
  before(async () => {
    srv = await startServer({
      provider: {
        getForecast: async (coords) => {
          calls += 1;
          assert.deepEqual(coords, { lat: -34.61, lon: -58.38 }); // redondeado a 2 decimales
          return raw;
        },
      },
    });
  });
  after(() => srv.close());

  test("devuelve el contrato normalizado con metadatos de fuente", async () => {
    const res = await srv.get("/api/weather?lat=-34.6131&lon=-58.3772");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.location.timezone, "America/Argentina/Buenos_Aires");
    assert.equal(body.daily.length, 7);
    assert.ok(body.hourly.length >= 48);
    assert.equal(body.meta.source.name, "Open-Meteo");
    assert.equal(body.meta.stale, false);
    assert.match(res.headers.get("cache-control"), /max-age=300/);
  });

  test("coordenadas cercanas comparten caché (una sola llamada al proveedor)", async () => {
    await srv.get("/api/weather?lat=-34.6129&lon=-58.3801");
    assert.equal(calls, 1);
  });

  test("400 con código estable ante coordenadas inválidas", async () => {
    const res = await srv.get("/api/weather?lat=999&lon=0");
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, "INVALID_REQUEST");
  });

  test("404 JSON para rutas desconocidas (incluidas las rutas antiguas)", async () => {
    const res = await srv.get("/currentWeather?city=Paris");
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, "NOT_FOUND");
  });

  test("health check responde sin consumir el rate limit", async () => {
    const res = await srv.get("/health");
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("ratelimit-policy"), null);
  });

  test("CORS: sólo los orígenes permitidos reciben cabecera", async () => {
    const ok = await srv.get("/health", { Origin: "https://buenclima.example" });
    assert.equal(ok.headers.get("access-control-allow-origin"), "https://buenclima.example");
    const blocked = await srv.get("/health", { Origin: "https://evil.example" });
    assert.equal(blocked.headers.get("access-control-allow-origin"), null);
  });

  test("cabeceras de seguridad de Helmet y sin x-powered-by", async () => {
    const res = await srv.get("/health");
    assert.equal(res.headers.get("x-powered-by"), null);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  });
});

describe("errores del proveedor", () => {
  test("un proveedor caído NO se reporta como 'Ciudad no encontrada'", async () => {
    const srv = await startServer({
      provider: { getForecast: async () => { throw new UpstreamError("open-meteo", { status: 503 }); } },
    });
    const res = await srv.get("/api/weather?lat=10&lon=10");
    const body = await res.json();
    await srv.close();
    assert.equal(res.status, 502);
    assert.equal(body.error.code, "UPSTREAM_UNAVAILABLE");
    assert.doesNotMatch(body.error.message, /ciudad no encontrada/i);
  });

  test("timeout del proveedor -> 504 UPSTREAM_TIMEOUT", async () => {
    const srv = await startServer({
      provider: { getForecast: async () => { throw new UpstreamTimeoutError("open-meteo"); } },
    });
    const res = await srv.get("/api/weather?lat=10&lon=10");
    await srv.close();
    assert.equal(res.status, 504);
    assert.equal((await res.json()).error.code, "UPSTREAM_TIMEOUT");
  });

  test("errores inesperados no filtran detalles internos en producción", async () => {
    const { config: base } = loadConfig({ NODE_ENV: "production", ALLOWED_ORIGINS: "https://x.example" });
    const app = createApp({
      config: base,
      weatherService: { getWeather: async () => { throw new Error("detalle interno /etc/secreto"); } },
      alertsService: {},
      logger: silentLogger,
    });
    const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api/weather?lat=1&lon=1`);
    const body = await res.json();
    await new Promise((resolve) => server.close(resolve));
    assert.equal(res.status, 500);
    assert.doesNotMatch(JSON.stringify(body), /secreto/);
  });

  test("si el proveedor falla después de cachear, sirve datos marcados como desactualizados", async () => {
    let t = FIXTURE_NOW;
    let fail = false;
    const srv = await startServer({
      provider: {
        getForecast: async () => {
          if (fail) throw new UpstreamError("open-meteo", { status: 500 });
          return raw;
        },
      },
      now: () => FIXTURE_NOW,
      cacheClock: () => t,
    });
    await srv.get("/api/weather?lat=1&lon=1");
    fail = true;
    t += 5000; // TTL (1 s) vencido, dentro de la ventana stale
    const res = await srv.get("/api/weather?lat=1&lon=1");
    const body = await res.json();
    await srv.close();
    assert.equal(res.status, 200);
    assert.equal(body.meta.stale, true);
    assert.equal(res.headers.get("cache-control"), "no-store");
  });
});

describe("rate limiting", () => {
  test("responde 429 con mensaje en español al superar el límite", async () => {
    const srv = await startServer({ provider: { getForecast: async () => raw }, rateMax: 2 });
    await srv.get("/api/weather?lat=1&lon=1");
    await srv.get("/api/weather?lat=1&lon=1");
    const res = await srv.get("/api/weather?lat=1&lon=1");
    const body = await res.json();
    await srv.close();
    assert.equal(res.status, 429);
    assert.equal(body.error.code, "RATE_LIMITED");
  });
});

describe("API /api/alerts", () => {
  test("valida coordenadas y devuelve fuente oficial", async () => {
    const srv = await startServer({ provider: { getForecast: async () => raw } });
    const bad = await srv.get("/api/alerts?lat=foo&lon=1");
    const ok = await srv.get("/api/alerts?lat=-34.6&lon=-58.4");
    const body = await ok.json();
    await srv.close();
    assert.equal(bad.status, 400);
    assert.equal(ok.status, 200);
    assert.equal(body.coverage, "AR");
    assert.deepEqual(body.alerts, []);
    assert.equal(body.partial, false);
  });
});

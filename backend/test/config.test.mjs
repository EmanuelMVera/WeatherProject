import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config/env.mjs";
import { parseCoordinates } from "../src/utils/validators.mjs";

test("valores por defecto en desarrollo", () => {
  const { config } = loadConfig({});
  assert.equal(config.port, 5000);
  assert.deepEqual(config.allowedOrigins, ["http://localhost:5173", "http://localhost:4173"]);
  assert.equal(config.openMeteo.baseUrl, "https://api.open-meteo.com/v1");
  assert.equal(config.cache.weatherTtlMs, 600_000);
});

test("ALLOWED_ORIGINS es obligatoria en producción", () => {
  assert.throws(() => loadConfig({ NODE_ENV: "production" }), /ALLOWED_ORIGINS/);
});

test("acepta ALLOWED_ORIGIN (singular) como alias con advertencia", () => {
  const { config, warnings } = loadConfig({
    NODE_ENV: "production",
    ALLOWED_ORIGIN: "https://buenclima.example/",
  });
  assert.deepEqual(config.allowedOrigins, ["https://buenclima.example"]);
  assert.equal(warnings.length, 1);
});

test("rechaza proveedores sin HTTPS y números inválidos", () => {
  assert.throws(() => loadConfig({ OPEN_METEO_BASE_URL: "http://api.open-meteo.com/v1" }), /HTTPS/);
  assert.throws(() => loadConfig({ PORT: "abc" }), /PORT/);
  assert.throws(() => loadConfig({ ALLOWED_ORIGINS: "not a url" }), /Origen inválido/);
});

test("validación de coordenadas", () => {
  assert.deepEqual(parseCoordinates({ lat: "-34.61", lon: "-58.38" }), { lat: -34.61, lon: -58.38 });
  assert.deepEqual(parseCoordinates({ lat: "90", lon: "-180" }), { lat: 90, lon: -180 });
  for (const query of [
    {},
    { lat: "-34.6" },
    { lat: "91", lon: "0" },
    { lat: "0", lon: "180.5" },
    { lat: "1e2", lon: "0" },
    { lat: "abc", lon: "0" },
    { lat: " ", lon: "0" },
    { lat: ["1", "2"], lon: "0" },
    { lat: "0x10", lon: "0" },
  ]) {
    assert.throws(() => parseCoordinates(query), { code: "INVALID_REQUEST" }, JSON.stringify(query));
  }
});

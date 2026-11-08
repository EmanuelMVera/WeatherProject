import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeOpenMeteoForecast } from "../src/adapters/openMeteoAdapter.mjs";
import { describeWeatherCode } from "../src/domain/weatherCodes.mjs";
import { toLocalParts } from "../src/utils/timezone.mjs";
import { FIXTURE_NOW, loadJsonFixture } from "./helpers.mjs";

const raw = loadJsonFixture("open-meteo-buenos-aires.json");

test("normaliza condiciones actuales con unidades explícitas (viento en km/h)", () => {
  const data = normalizeOpenMeteoForecast(raw, { now: FIXTURE_NOW });
  assert.equal(data.units.windSpeed, "km/h");
  assert.equal(data.location.timezone, "America/Argentina/Buenos_Aires");
  assert.equal(data.current.temperature, raw.current.temperature_2m);
  assert.equal(data.current.windSpeed, raw.current.wind_speed_10m); // ya viene en km/h, sin reconvertir
  assert.equal(data.current.windGusts, raw.current.wind_gusts_10m);
  assert.equal(data.current.windDirection, raw.current.wind_direction_10m);
  assert.equal(data.current.isDay, false);
  assert.equal(data.current.condition.icon, "partly-cloudy-night");
  assert.equal(data.current.time, "2026-11-07T04:30:00.000Z");
  // 04:30 UTC = 01:30 en Buenos Aires (UTC-3)
  assert.deepEqual(data.current.local, { date: "2026-11-07", hour: 1, minute: 30 });
});

test("mínimas y máximas diarias son las del proveedor, no de una franja horaria", () => {
  const data = normalizeOpenMeteoForecast(raw, { now: FIXTURE_NOW });
  assert.equal(data.daily.length, 7);
  data.daily.forEach((day, i) => {
    assert.equal(day.temperatureMax, raw.daily.temperature_2m_max[i]);
    assert.equal(day.temperatureMin, raw.daily.temperature_2m_min[i]);
  });
  assert.equal(data.daily[0].date, "2026-11-07");
  assert.equal(data.daily[6].date, "2026-11-13");
});

test("las horas se expresan en la zona de la localidad, no la del servidor", () => {
  const data = normalizeOpenMeteoForecast(raw, { now: FIXTURE_NOW });
  const first = data.hourly[0];
  // La hora en curso (01:00 local) es la primera que se conserva.
  assert.equal(first.localHour, 1);
  assert.equal(first.localDate, "2026-11-07");
  // Cambio de día: la hora 23 del 7 sigue con la 0 del 8.
  const idx = data.hourly.findIndex((h) => h.localDate === "2026-11-08");
  assert.equal(data.hourly[idx - 1].localHour, 23);
  assert.equal(data.hourly[idx].localHour, 0);
});

test("respeta cambios de horario de verano (Europe/Madrid, 29/03/2026)", () => {
  // 00:00 UTC = 01:00 CET; 01:00 UTC = 03:00 CEST (se saltea la 02:00)
  const t0 = Date.UTC(2026, 2, 29, 0) / 1000;
  const synthetic = {
    timezone: "Europe/Madrid",
    hourly: { time: [t0, t0 + 3600, t0 + 7200], temperature_2m: [5, 6, 7] },
    daily: { time: [Date.UTC(2026, 2, 28, 23) / 1000] },
  };
  const data = normalizeOpenMeteoForecast(synthetic, { now: t0 * 1000 });
  assert.deepEqual(data.hourly.map((h) => h.localHour), [1, 3, 4]);
  assert.equal(data.daily[0].date, "2026-03-29");
});

test("datos faltantes quedan como null, nunca como 0", () => {
  const partial = structuredClone(raw);
  partial.current.temperature_2m = null;
  delete partial.current.wind_gusts_10m;
  partial.hourly.precipitation_probability = undefined;
  partial.daily.uv_index_max[0] = null;
  const data = normalizeOpenMeteoForecast(partial, { now: FIXTURE_NOW });
  assert.equal(data.current.temperature, null);
  assert.equal(data.current.windGusts, null);
  assert.equal(data.hourly[0].precipitationProbability, null);
  assert.equal(data.daily[0].uvIndexMax, null);
  // 0 mm reales se conservan como 0
  assert.equal(data.daily[1].precipitationSum, 0);
});

test("amanecer/atardecer inválidos (zonas polares) se devuelven como null", () => {
  const polar = structuredClone(raw);
  polar.daily.sunrise[0] = polar.daily.sunset[0];
  const data = normalizeOpenMeteoForecast(polar, { now: FIXTURE_NOW });
  assert.equal(data.daily[0].sunrise, null);
  assert.equal(data.daily[0].sunset, null);
  assert.notEqual(data.daily[1].sunrise, null);
});

test("rechaza respuestas sin zona horaria o sin bloques requeridos", () => {
  assert.throws(() => normalizeOpenMeteoForecast({ ...raw, timezone: "Mars/Olympus" }), {
    code: "UPSTREAM_INVALID_DATA",
  });
  assert.throws(() => normalizeOpenMeteoForecast({ ...raw, daily: undefined }), {
    code: "UPSTREAM_INVALID_DATA",
  });
  assert.throws(() => normalizeOpenMeteoForecast(null), { code: "UPSTREAM_INVALID_DATA" });
});

test("códigos WMO: descripción en español e ícono día/noche", () => {
  assert.deepEqual(describeWeatherCode(0, true), { code: 0, description: "Despejado", icon: "clear-day" });
  assert.equal(describeWeatherCode(0, false).icon, "clear-night");
  assert.equal(describeWeatherCode(95, false).icon, "thunderstorm");
  assert.equal(describeWeatherCode(63).description, "Lluvia moderada");
  assert.equal(describeWeatherCode(12345).icon, "unknown");
  assert.equal(describeWeatherCode(null).description, "Condición no disponible");
});

test("toLocalParts no depende de la zona horaria del proceso", () => {
  const instant = Date.UTC(2026, 0, 1, 2, 15);
  assert.deepEqual(toLocalParts(instant, "America/Argentina/Buenos_Aires"), {
    date: "2025-12-31",
    hour: 23,
    minute: 15,
  });
  assert.deepEqual(toLocalParts(instant, "Asia/Tokyo"), { date: "2026-01-01", hour: 11, minute: 15 });
});

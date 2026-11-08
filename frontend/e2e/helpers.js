import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
export const weather = JSON.parse(
  readFileSync(path.join(dir, "../src/test/fixtures/weather-buenos-aires.json"), "utf8")
);

export const FIXTURE_NOW = Date.parse("2026-11-07T04:30:00Z");

export const GEO_RESULTS = {
  results: [
    {
      id: 3860259,
      name: "Córdoba",
      latitude: -31.4135,
      longitude: -64.18105,
      country_code: "AR",
      country: "Argentina",
      admin1: "Córdoba",
      admin2: "Departamento Capital",
    },
    {
      id: 2519240,
      name: "Córdoba",
      latitude: 37.89155,
      longitude: -4.77275,
      country_code: "ES",
      country: "España",
      admin1: "Andalucía",
    },
  ],
};

/**
 * Simula backend y geocoding para que los tests no dependan del clima real
 * ni de Internet. Devuelve la lista de URLs de clima pedidas.
 */
export async function mockApis(page, { weatherHandler } = {}) {
  const weatherCalls = [];
  await page.clock.setFixedTime(FIXTURE_NOW);
  await page.route("**/geocoding-api.open-meteo.com/**", (route) => route.fulfill({ json: GEO_RESULTS }));
  await page.route("**/api/weather?*", (route) => {
    weatherCalls.push(route.request().url());
    if (weatherHandler) return weatherHandler(route);
    return route.fulfill({ json: weather });
  });
  await page.route("**/api/alerts?*", (route) =>
    route.fulfill({
      json: { coverage: "AR", alerts: [], partial: false, checkedAt: new Date(FIXTURE_NOW).toISOString(), stale: false },
    })
  );
  await page.route("**/health", (route) => route.fulfill({ json: { status: "ok" } }));
  await page.route("**/fonts.googleapis.com/**", (route) => route.abort());
  return weatherCalls;
}

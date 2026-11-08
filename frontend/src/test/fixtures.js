import weather from "./fixtures/weather-buenos-aires.json";

/** Instante de las condiciones actuales del fixture (2026-11-07 01:30 en Buenos Aires). */
export const FIXTURE_NOW = Date.parse("2026-11-07T04:30:00Z");

export function weatherFixture(overrides = {}) {
  return { ...structuredClone(weather), ...overrides };
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

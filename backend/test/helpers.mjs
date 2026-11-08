import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));

export function loadFixture(name) {
  return readFileSync(path.join(dir, "fixtures", name), "utf8");
}

export function loadJsonFixture(name) {
  return JSON.parse(loadFixture(name));
}

/** Instante de `current.time` en el fixture de Open-Meteo (2026-11-07T04:30Z). */
export const FIXTURE_NOW = 1794025800 * 1000;

export const silentLogger = { info() {}, warn() {}, error() {} };

/** Respuesta mínima compatible con fetch. */
export function fakeResponse(status, body) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(text),
    text: async () => text,
  };
}

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
const NAMES = {
  N: "norte",
  NE: "noreste",
  E: "este",
  SE: "sudeste",
  S: "sur",
  SO: "sudoeste",
  O: "oeste",
  NO: "noroeste",
};

/**
 * Dirección meteorológica (desde dónde sopla el viento) en 8 rumbos.
 * @param {number|null} degrees
 * @returns {{ short: string, name: string } | null}
 */
export function windDirection(degrees) {
  if (typeof degrees !== "number" || !Number.isFinite(degrees)) return null;
  const normalized = ((degrees % 360) + 360) % 360;
  const short = DIRECTIONS[Math.round(normalized / 45) % 8];
  return { short, name: NAMES[short] };
}

/** Descripción breve basada en la escala de Beaufort (km/h). */
export function windDescription(speedKmh) {
  if (typeof speedKmh !== "number" || !Number.isFinite(speedKmh)) return null;
  if (speedKmh < 2) return "Calma";
  if (speedKmh < 12) return "Brisa leve";
  if (speedKmh < 29) return "Moderado";
  if (speedKmh < 50) return "Fuerte";
  if (speedKmh < 75) return "Muy fuerte";
  return "Temporal";
}

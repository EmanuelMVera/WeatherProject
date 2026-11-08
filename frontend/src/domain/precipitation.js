/**
 * Reglas para describir la lluvia sin confundir probabilidad (%) con
 * cantidad (mm). Las frases sólo se generan cuando los datos las respaldan.
 */

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Umbral de probabilidad a partir del cual decimos "se prevé lluvia". */
export const LIKELY_PROBABILITY = 50;
/** Umbral para mencionar "chances bajas". */
export const POSSIBLE_PROBABILITY = 30;
/** Cantidad mínima para considerar que llueve (mm). */
export const MIN_RAIN_MM = 0.1;

/**
 * Intensidad a partir de la tasa horaria (mm/h), según la clasificación
 * habitual (AMS): débil < 2,5 · moderada < 7,6 · fuerte ≥ 7,6.
 * @param {number|null} mmPerHour
 */
export function rainIntensity(mmPerHour) {
  if (!isNum(mmPerHour) || mmPerHour < MIN_RAIN_MM) return null;
  if (mmPerHour < 2.5) return { key: "light", label: "débil" };
  if (mmPerHour < 7.6) return { key: "moderate", label: "moderada" };
  return { key: "heavy", label: "fuerte" };
}

export const DAY_PERIODS = [
  { key: "dawn", label: "Madrugada", phrase: "la madrugada", from: 0, to: 6 },
  { key: "morning", label: "Mañana", phrase: "la mañana", from: 6, to: 12 },
  { key: "afternoon", label: "Tarde", phrase: "la tarde", from: 12, to: 18 },
  { key: "night", label: "Noche", phrase: "la noche", from: 18, to: 24 },
];

/**
 * Agrupa horas de UN día por franja.
 * @param {Array<{ localHour: number, precipitationProbability: number|null, precipitation: number|null }>} hours
 */
export function summarizeByPeriod(hours) {
  return DAY_PERIODS.map((period) => {
    const inPeriod = hours.filter((h) => h.localHour >= period.from && h.localHour < period.to);
    const probs = inPeriod.map((h) => h.precipitationProbability).filter(isNum);
    const amounts = inPeriod.map((h) => h.precipitation).filter(isNum);
    return {
      ...period,
      hours: inPeriod.length,
      maxProbability: probs.length ? Math.max(...probs) : null,
      totalMm: amounts.length ? amounts.reduce((a, b) => a + b, 0) : null,
    };
  }).filter((p) => p.hours > 0);
}

function isLikely({ maxProbability, totalMm }) {
  return (
    isNum(maxProbability) &&
    maxProbability >= LIKELY_PROBABILITY &&
    (totalMm == null || totalMm >= MIN_RAIN_MM)
  );
}

function joinEs(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/**
 * Frase para un día a partir de sus horas.
 * @returns {string|null}  null si no hay datos de probabilidad.
 */
export function describeDayRain(hours) {
  const periods = summarizeByPeriod(hours);
  const withData = periods.filter((p) => isNum(p.maxProbability));
  if (withData.length === 0) return null;

  const likely = withData.filter(isLikely);
  if (likely.length === withData.length && likely.length > 1) {
    return "Se prevé lluvia durante todo el día.";
  }
  if (likely.length > 0) {
    return `Se prevé lluvia durante ${joinEs(likely.map((p) => p.phrase))}.`;
  }
  const maxProb = Math.max(...withData.map((p) => p.maxProbability));
  if (maxProb >= POSSIBLE_PROBABILITY) {
    return `Chances bajas de lluvia (hasta ${Math.round(maxProb)} %).`;
  }
  return "No se prevé lluvia.";
}

/**
 * Resumen de las próximas horas (normalmente 24).
 * @param {Array<{ time: string, precipitationProbability: number|null, precipitation: number|null }>} hours
 * @param {(iso: string) => string} formatHour
 */
export function summarizeUpcomingRain(hours, formatHour) {
  const probs = hours.map((h) => h.precipitationProbability).filter(isNum);
  const amounts = hours.map((h) => h.precipitation).filter(isNum);
  const totalMm = amounts.length ? amounts.reduce((a, b) => a + b, 0) : null;
  const maxProbability = probs.length ? Math.max(...probs) : null;
  const peak = hours.reduce(
    (best, h) =>
      isNum(h.precipitation) && (!best || h.precipitation > best.precipitation) ? h : best,
    null
  );
  const peakIntensity = rainIntensity(peak?.precipitation);

  let sentence = null;
  if (maxProbability == null) {
    sentence = null;
  } else {
    const firstLikely = hours.find((h) => isLikely({ maxProbability: h.precipitationProbability, totalMm: h.precipitation }));
    if (firstLikely) {
      sentence = `Se prevé lluvia desde las ${formatHour(firstLikely.time)}.`;
    } else if (maxProbability >= POSSIBLE_PROBABILITY) {
      sentence = `Chances bajas de lluvia (hasta ${Math.round(maxProbability)} %).`;
    } else {
      sentence = `No se prevé lluvia en las próximas ${hours.length} horas.`;
    }
  }

  return { sentence, totalMm, maxProbability, peak, peakIntensity };
}

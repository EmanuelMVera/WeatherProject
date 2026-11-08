/**
 * Recomendaciones orientativas para actividades al aire libre.
 *
 * Reglas simples y explicables: cada una agrega un motivo visible al
 * usuario y puede bajar el nivel ("good" -> "caution" -> "bad"). Se evalúan
 * las condiciones actuales y las próximas 3 horas, que son los mismos datos
 * que muestra la interfaz, para que nunca se contradigan.
 */

import { formatTime } from "../lib/format.js";
import { LIKELY_PROBABILITY, MIN_RAIN_MM } from "./precipitation.js";

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const OUTLOOK_TITLES = {
  good: "Buen momento para salir",
  caution: "Condiciones aceptables, con precaución",
  bad: "Mejor postergar las actividades al aire libre",
};

/**
 * Resumen general: el nivel de "Caminar" (la actividad más tolerante) y
 * avisos para el resto del día basados en las próximas 12 horas.
 * @param {ReturnType<typeof recommendActivities>} recs
 * @param {object[]} hours
 * @param {string} timeZone
 */
export function summarizeOutlook(recs, hours, timeZone) {
  const level = recs.find((r) => r.key === "walk")?.level ?? "caution";
  const tips = [];
  const later = (hours ?? []).slice(3, 12);
  const rainy = later.find(
    (h) =>
      isNum(h.precipitationProbability) &&
      h.precipitationProbability >= LIKELY_PROBABILITY &&
      (h.precipitation == null || h.precipitation >= MIN_RAIN_MM)
  );
  if (rainy) tips.push(`Se prevé lluvia desde las ${formatTime(rainy.time, timeZone)}: si vas a salir más tarde, llevá paraguas.`);
  return { level, title: OUTLOOK_TITLES[level], tips };
}
const RANK = { good: 0, caution: 1, bad: 2 };
const THUNDER_CODES = new Set([95, 96, 99]);

export const ACTIVITIES = [
  { key: "walk", label: "Caminar" },
  { key: "run", label: "Correr" },
  { key: "bike", label: "Bicicleta" },
];

export const LEVEL_LABELS = {
  good: "Buenas condiciones",
  caution: "Con precaución",
  bad: "No recomendado",
};

/**
 * @param {{ current: object, hourly: object[] }} data  Contrato del backend.
 * @param {number} [windowHours=3]
 */
export function evaluateConditions({ current, hourly }, windowHours = 3) {
  const next = (hourly ?? []).slice(0, windowHours);
  const probs = next.map((h) => h.precipitationProbability).filter(isNum);
  const mm = next.map((h) => h.precipitation).filter(isNum);
  const gusts = [current?.windGusts, ...next.map((h) => h.windGusts)].filter(isNum);
  const winds = [current?.windSpeed, ...next.map((h) => h.windSpeed)].filter(isNum);
  return {
    feelsLike: isNum(current?.apparentTemperature) ? current.apparentTemperature : current?.temperature ?? null,
    windSpeed: winds.length ? Math.max(...winds) : null,
    windGusts: gusts.length ? Math.max(...gusts) : null,
    rainProbability: probs.length ? Math.max(...probs) : null,
    rainMm: mm.length ? mm.reduce((a, b) => a + b, 0) : null,
    thunder: [current?.weatherCode, ...next.map((h) => h.weatherCode)].some((c) => THUNDER_CODES.has(c)),
    uvIndex: isNum(current?.uvIndex) ? current.uvIndex : null,
    isDay: current?.isDay ?? null,
  };
}

/**
 * @param {ReturnType<typeof evaluateConditions>} c
 * @returns {Array<{ key: string, label: string, level: "good"|"caution"|"bad", reasons: string[] }> | null}
 *          null si faltan datos esenciales.
 */
export function recommendActivities(c) {
  if (!isNum(c.feelsLike) && !isNum(c.rainProbability) && !isNum(c.windSpeed)) return null;

  return ACTIVITIES.map(({ key, label }) => {
    let level = "good";
    const reasons = [];
    const flag = (newLevel, reason) => {
      if (RANK[newLevel] > RANK[level]) level = newLevel;
      reasons.push(reason);
    };
    const active = key === "run" || key === "bike";

    if (c.thunder) {
      flag("bad", "Hay tormenta prevista en las próximas horas.");
    }

    if (isNum(c.rainProbability)) {
      const raining = c.rainProbability >= 70 && (c.rainMm == null || c.rainMm >= 0.5);
      if (raining) {
        flag(key === "bike" ? "bad" : "caution", `Lluvia probable (${Math.round(c.rainProbability)} %): llevá abrigo impermeable.`);
      } else if (c.rainProbability >= 40) {
        flag("caution", `Puede llover (${Math.round(c.rainProbability)} %).`);
      }
    }

    if (isNum(c.feelsLike)) {
      if (c.feelsLike >= 35) {
        flag(active ? "bad" : "caution", "Calor extremo: hidratate y evitá el esfuerzo.");
      } else if (c.feelsLike >= 30) {
        flag(active ? "caution" : "good", active ? "Calor: bajá la intensidad y llevá agua." : "Hace calor: llevá agua.");
      } else if (c.feelsLike <= -10) {
        flag("bad", "Frío extremo.");
      } else if (c.feelsLike <= 3) {
        flag("caution", "Mucho frío: abrigate por capas.");
      }
    }

    const gusts = c.windGusts ?? 0;
    const wind = c.windSpeed ?? 0;
    if (gusts >= 70 || wind >= 50) {
      flag("bad", "Viento muy fuerte.");
    } else if (gusts >= 50 || wind >= 30) {
      flag(key === "bike" ? "bad" : "caution", "Viento fuerte con ráfagas.");
    } else if (key === "bike" && (gusts >= 35 || wind >= 20)) {
      flag("caution", "Viento moderado: puede costar pedalear en contra.");
    }

    if (c.isDay !== false && isNum(c.uvIndex) && Math.round(c.uvIndex) >= 8) {
      flag("caution", "UV muy alto: protector solar, gorra y sombra.");
    } else if (c.isDay !== false && isNum(c.uvIndex) && Math.round(c.uvIndex) >= 6) {
      reasons.push("UV alto: usá protector solar.");
    }

    if (c.isDay === false && key !== "walk") {
      reasons.push("Es de noche: usá ropa reflectiva y luces.");
    }

    if (reasons.length === 0) reasons.push("Condiciones favorables.");
    return { key, label, level, reasons };
  });
}

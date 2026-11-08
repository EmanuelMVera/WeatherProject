/**
 * Utilidades de fecha/hora que dependen SIEMPRE de la zona horaria IANA de la
 * localidad consultada, nunca de la zona del servidor. Intl aplica las reglas
 * de horario de verano vigentes para cada instante.
 */

const formatterCache = new Map();

function partsFormatter(timeZone) {
  let fmt = formatterCache.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatterCache.set(timeZone, fmt);
  }
  return fmt;
}

/** ¿Es un identificador IANA que el runtime reconoce? */
export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || timeZone.length === 0) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fecha y hora "de pared" de un instante en una zona horaria.
 * @param {number} epochMs
 * @param {string} timeZone
 * @returns {{ date: string, hour: number, minute: number }}  date = "YYYY-MM-DD"
 */
export function toLocalParts(epochMs, timeZone) {
  const parts = Object.fromEntries(
    partsFormatter(timeZone)
      .formatToParts(new Date(epochMs))
      .map((p) => [p.type, p.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

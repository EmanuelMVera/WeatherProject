/**
 * Formateadores en español de Argentina. Todas las horas se expresan en la
 * zona horaria IANA de la localidad consultada (nunca la del navegador).
 */

const LOCALE = "es-AR";
const cache = new Map();

function dtf(options) {
  const key = JSON.stringify(options);
  let fmt = cache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(LOCALE, options);
    cache.set(key, fmt);
  }
  return fmt;
}

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

export const DASH = "—";

/** 15.4 -> "15°" ; null -> "—" */
export function formatTemp(value) {
  return isNum(value) ? `${Math.round(value)}°` : DASH;
}

/** Número con coma decimal. */
export function formatNumber(value, maximumFractionDigits = 0) {
  if (!isNum(value)) return DASH;
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(value);
}

export function formatPercent(value) {
  return isNum(value) ? `${Math.round(value)} %` : DASH;
}

/** Milímetros con un decimal: 0.04 -> "0 mm", 1.25 -> "1,3 mm". */
export function formatMm(value) {
  return isNum(value) ? `${formatNumber(value, 1)} mm` : DASH;
}

export function formatKmh(value) {
  return isNum(value) ? `${Math.round(value)} km/h` : DASH;
}

/** "14:05" en la zona de la localidad. */
export function formatTime(iso, timeZone) {
  if (!iso) return DASH;
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) return DASH;
  return dtf({ timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
}

/** Fecha local "YYYY-MM-DD" de un instante en una zona. */
export function localDateOf(instant, timeZone) {
  const parts = Object.fromEntries(
    dtf({ timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date(instant))
      .map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** Fechas "YYYY-MM-DD" se interpretan como fecha de calendario (sin zona). */
function calendarDate(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** "sábado" */
export function formatWeekday(dateStr, style = "long") {
  return dtf({ timeZone: "UTC", weekday: style }).format(calendarDate(dateStr)).replace(".", "");
}

/** "Hoy" | "Mañana" | "Lunes" */
export function relativeDayLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return "Hoy";
  const diff = Math.round((calendarDate(dateStr) - calendarDate(todayStr)) / 86_400_000);
  if (diff === 1) return "Mañana";
  return capitalize(formatWeekday(dateStr));
}

/** "Sábado 7 de noviembre" */
export function formatLongDate(dateStr) {
  // es-AR produce "sábado, 7 de noviembre": quitamos la coma tras el día.
  return capitalize(
    dtf({ timeZone: "UTC", weekday: "long", day: "numeric", month: "long" })
      .format(calendarDate(dateStr))
      .replace(/^([^\s,]+),\s/, "$1 ")
  );
}

/** "7/11" */
export function formatShortDate(dateStr) {
  return dtf({ timeZone: "UTC", day: "numeric", month: "numeric" }).format(calendarDate(dateStr));
}

/** "13 h 42 min" */
export function formatDuration(seconds) {
  if (!isNum(seconds)) return DASH;
  const totalMin = Math.round(seconds / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

/** "recién", "hace 5 min", "hace 2 h" */
export function formatRelativeTime(fromMs, nowMs = Date.now()) {
  if (!isNum(fromMs)) return DASH;
  const diffMin = Math.max(0, Math.round((nowMs - fromMs) / 60_000));
  if (diffMin < 1) return "recién";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const h = Math.round(diffMin / 60);
  if (h < 48) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
}

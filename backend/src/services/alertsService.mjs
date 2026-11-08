import { isPointInPolygon } from "../utils/geo.mjs";

export const SMN_SOURCE = Object.freeze({
  name: "Servicio Meteorológico Nacional (SMN)",
  url: "https://www.smn.gob.ar/alertas",
  license: "CC BY 4.0",
});

const SEVERITY_LABELS = {
  Extreme: "Extrema",
  Severe: "Severa",
  Moderate: "Moderada",
  Minor: "Menor",
  Unknown: "Sin especificar",
};
const SEVERITY_RANK = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1, Unknown: 0 };

/**
 * Filtra alertas CAP vigentes que cubren un punto.
 * - Sólo mensajes reales (`status=Actual`), no cancelaciones.
 * - Se descartan alertas reemplazadas por una actualización posterior.
 * - Se descartan las vencidas.
 * - Se deduplican alertas idénticas publicadas para polígonos vecinos.
 *
 * @param {Array<ReturnType<import("../adapters/capParser.mjs").parseCapAlert>>} alerts
 * @param {{ lat: number, lon: number, now: number }} query
 */
export function selectAlertsForPoint(alerts, { lat, lon, now }) {
  const superseded = new Set(alerts.flatMap((a) => a.references));
  const seen = new Set();
  const selected = [];

  for (const alert of alerts) {
    if (alert.status !== "Actual") continue;
    if (alert.msgType === "Cancel") continue;
    if (superseded.has(alert.identifier)) continue;
    const expires = alert.expires ? Date.parse(alert.expires) : NaN;
    if (!Number.isFinite(expires) || expires <= now) continue;
    if (!alert.polygons.some((polygon) => isPointInPolygon(lat, lon, polygon))) continue;

    const dedupeKey = [alert.event, alert.severity, alert.onset, alert.expires, alert.description].join("|");
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    selected.push({
      id: alert.identifier,
      event: alert.event,
      headline: alert.headline,
      description: alert.description,
      instruction: alert.instruction,
      severity: alert.severity,
      severityLabel: SEVERITY_LABELS[alert.severity] ?? SEVERITY_LABELS.Unknown,
      urgency: alert.urgency,
      onset: alert.onset ? new Date(alert.onset).toISOString() : null,
      expires: new Date(expires).toISOString(),
      sent: alert.sent ? new Date(alert.sent).toISOString() : null,
    });
  }

  return selected.sort(
    (a, b) =>
      (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0) ||
      Date.parse(a.onset ?? a.expires) - Date.parse(b.onset ?? b.expires)
  );
}

/**
 * @param {{ provider: { getActiveAlerts: Function }, cache: import("../lib/ttlCache.mjs").TtlCache, now?: () => number }} deps
 */
export function createAlertsService({ provider, cache, now = Date.now }) {
  return {
    async getAlerts({ lat, lon }) {
      const result = await cache.getOrLoad("smn:alerts", () => provider.getActiveAlerts());
      const { alerts, partial } = result.value;
      return {
        coverage: "AR",
        source: SMN_SOURCE,
        alerts: selectAlertsForPoint(alerts, { lat, lon, now: now() }),
        // `partial`: algún documento del feed no se pudo leer; la ausencia de
        // alertas no se puede garantizar.
        partial: Boolean(partial),
        checkedAt: new Date(result.storedAt).toISOString(),
        stale: result.status === "STALE",
      };
    },
  };
}

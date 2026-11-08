import { httpGet } from "../lib/httpClient.mjs";
import { UpstreamDataError } from "../errors.mjs";
import { parseCapAlert, parseCapFeedLinks } from "../adapters/capParser.mjs";

/**
 * Alertas oficiales del Servicio Meteorológico Nacional (Argentina).
 * Fuente: feed CAP publicado por el SMN (licencia CC BY 4.0), registrado en
 * el WMO Register of Alerting Authorities.
 */
export const SMN_FEED_URL = "https://ssl.smn.gob.ar/CAP/AR.php";
const CONCURRENCY = 6;
const USER_AGENT = "BuenClima/1.0 (+https://github.com/EmanuelMVera/WeatherProject)";

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * @param {{ timeoutMs?: number, fetchImpl?: typeof fetch, logger?: object }} opts
 */
export function createSmnAlertsProvider({ timeoutMs = 8000, fetchImpl, logger = console } = {}) {
  const get = (url, retries) =>
    httpGet(url, {
      provider: "smn",
      as: "text",
      timeoutMs,
      retries,
      fetchImpl,
      logger,
      headers: { "User-Agent": USER_AGENT },
    });

  return {
    name: "smn",

    /**
     * Descarga el feed y todos los documentos CAP referenciados.
     * @returns {Promise<{ alerts: ReturnType<typeof parseCapAlert>[], partial: boolean }>}
     */
    async getActiveAlerts() {
      const rss = await get(SMN_FEED_URL, 2);
      if (typeof rss !== "string" || !rss.includes("<rss")) {
        throw new UpstreamDataError("smn", "el feed no es RSS");
      }
      const links = parseCapFeedLinks(rss);

      let failures = 0;
      const docs = await mapWithConcurrency(links, CONCURRENCY, async (link) => {
        try {
          return parseCapAlert(await get(link, 1));
        } catch {
          failures += 1;
          return null;
        }
      });

      // Si fallaron casi todos, no podemos afirmar nada sobre las alertas.
      if (links.length > 0 && failures / links.length > 0.5) {
        throw new UpstreamDataError("smn", `fallaron ${failures}/${links.length} documentos CAP`);
      }
      if (failures > 0) logger.warn?.(`[smn] ${failures}/${links.length} documentos CAP no se pudieron leer`);

      return { alerts: docs.filter(Boolean), partial: failures > 0 };
    },
  };
}

/**
 * Parser mínimo para el feed RSS y los documentos CAP 1.2 que publica el SMN.
 *
 * Los documentos son pequeños y de estructura fija, así que extraemos sólo
 * las etiquetas necesarias en lugar de sumar un parser XML completo como
 * dependencia. Cualquier documento que no tenga la forma esperada se descarta.
 */

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export function decodeXmlText(text) {
  if (text == null) return "";
  let value = String(text);
  const cdata = value.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  if (cdata) return cdata[1].trim();
  value = value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeCodePoint(parseInt(dec, 10)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => NAMED_ENTITIES[name]);
  return value.trim();
}

function safeCodePoint(cp) {
  try {
    return String.fromCodePoint(cp);
  } catch {
    return "";
  }
}

/** Todas las ocurrencias de <tag>…</tag>, con o sin prefijo de namespace. */
function allTags(xml, tag) {
  const re = new RegExp(`<(?:[\\w-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w-]+:)?${tag}>`, "g");
  const out = [];
  let match;
  while ((match = re.exec(xml)) !== null) out.push(match[1]);
  return out;
}

function firstTag(xml, tag) {
  const [value] = allTags(xml, tag);
  return value === undefined ? null : decodeXmlText(value);
}

/**
 * Extrae los enlaces a documentos CAP del feed RSS.
 * Sólo acepta URLs HTTPS del dominio del SMN (evita SSRF si el feed se altera).
 * @param {string} rssXml
 * @returns {string[]}
 */
export function parseCapFeedLinks(rssXml) {
  const links = allTags(rssXml, "item")
    .map((item) => firstTag(item, "link"))
    .filter(Boolean);
  const unique = [...new Set(links)];
  return unique.filter((link) => {
    try {
      const url = new URL(link);
      return url.protocol === "https:" && url.hostname === "ssl.smn.gob.ar";
    } catch {
      return false;
    }
  });
}

/**
 * "lat,lon lat,lon …" -> [[lat, lon], …]. Devuelve null si el polígono es inválido.
 * @param {string} text
 */
export function parseCapPolygon(text) {
  const points = String(text)
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map(Number));
  if (points.length < 4) return null;
  if (points.some((p) => p.length !== 2 || !p.every(Number.isFinite))) return null;
  return points;
}

/**
 * @param {string} xml  Documento CAP 1.2
 * @returns {null | {
 *   identifier: string, sent: string|null, status: string|null, msgType: string|null,
 *   references: string[], event: string, headline: string|null, description: string|null,
 *   instruction: string|null, severity: string|null, urgency: string|null, certainty: string|null,
 *   onset: string|null, expires: string|null, web: string|null, polygons: number[][][]
 * }}
 */
export function parseCapAlert(xml) {
  if (typeof xml !== "string" || !/<(?:[\w-]+:)?alert\b/.test(xml)) return null;

  const identifier = firstTag(xml, "identifier");
  const [info] = allTags(xml, "info");
  if (!identifier || !info) return null;

  const polygons = allTags(info, "area")
    .flatMap((area) => allTags(area, "polygon"))
    .map((p) => parseCapPolygon(decodeXmlText(p)))
    .filter(Boolean);

  // `references`: "sender,identifier,sent sender,identifier,sent …"
  const referencesRaw = firstTag(xml, "references");
  const references = referencesRaw
    ? referencesRaw
        .split(/\s+/)
        .map((triplet) => triplet.split(",")[1])
        .filter(Boolean)
    : [];

  return {
    identifier,
    sent: firstTag(xml, "sent"),
    status: firstTag(xml, "status"),
    msgType: firstTag(xml, "msgType"),
    references,
    event: firstTag(info, "event") || "Alerta meteorológica",
    headline: firstTag(info, "headline"),
    description: firstTag(info, "description"),
    instruction: firstTag(info, "instruction"),
    severity: firstTag(info, "severity"),
    urgency: firstTag(info, "urgency"),
    certainty: firstTag(info, "certainty"),
    onset: firstTag(info, "onset") || firstTag(info, "effective"),
    expires: firstTag(info, "expires"),
    web: firstTag(info, "web"),
    polygons,
  };
}

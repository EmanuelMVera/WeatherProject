import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeXmlText, parseCapAlert, parseCapFeedLinks } from "../src/adapters/capParser.mjs";
import { selectAlertsForPoint, createAlertsService } from "../src/services/alertsService.mjs";
import { createSmnAlertsProvider, SMN_FEED_URL } from "../src/providers/smnAlerts.mjs";
import { isPointInPolygon } from "../src/utils/geo.mjs";
import { TtlCache } from "../src/lib/ttlCache.mjs";
import { fakeResponse, loadFixture, silentLogger } from "./helpers.mjs";

const capXml = loadFixture("smn-cap-viento.xml");
// Punto dentro del polígono del fixture (norte de Salta) y punto fuera (CABA).
const INSIDE = { lat: -23.2, lon: -63.8 };
const OUTSIDE = { lat: -34.61, lon: -58.38 };
const BEFORE_EXPIRY = Date.parse("2026-11-07T10:00:00-03:00");
const AFTER_EXPIRY = Date.parse("2026-11-07T16:00:00-03:00");

test("parsea un documento CAP real del SMN", () => {
  const alert = parseCapAlert(capXml);
  assert.equal(alert.event, "Viento");
  assert.equal(alert.status, "Actual");
  assert.equal(alert.severity, "Moderate");
  assert.match(alert.description, /ráfagas que pueden alcanzar los 70 km\/h/);
  assert.equal(alert.expires, "2026-11-07T14:59:59-03:00");
  assert.equal(alert.polygons.length, 1);
  assert.ok(alert.polygons[0].length > 10);
  assert.ok(alert.references.length >= 1);
});

test("decodifica entidades numéricas y con nombre", () => {
  assert.equal(decodeXmlText("r&#xE1;fagas &amp; &#233;l"), "ráfagas & él");
  assert.equal(decodeXmlText("<![CDATA[ texto <b> ]]>"), "texto <b>");
});

test("sólo acepta enlaces HTTPS del dominio del SMN", () => {
  const rss = `<rss><channel>
    <item><link>https://ssl.smn.gob.ar/feeds/CAP/a.xml</link></item>
    <item><link>https://evil.example.com/b.xml</link></item>
    <item><link>http://ssl.smn.gob.ar/c.xml</link></item>
    <item><link>https://ssl.smn.gob.ar/feeds/CAP/a.xml</link></item>
  </channel></rss>`;
  assert.deepEqual(parseCapFeedLinks(rss), ["https://ssl.smn.gob.ar/feeds/CAP/a.xml"]);
});

test("punto dentro de polígono", () => {
  const square = [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]];
  assert.equal(isPointInPolygon(5, 5, square), true);
  assert.equal(isPointInPolygon(15, 5, square), false);
});

test("filtra por ubicación y vigencia", () => {
  const alert = parseCapAlert(capXml);
  assert.equal(selectAlertsForPoint([alert], { ...INSIDE, now: BEFORE_EXPIRY }).length, 1);
  assert.equal(selectAlertsForPoint([alert], { ...OUTSIDE, now: BEFORE_EXPIRY }).length, 0);
  assert.equal(selectAlertsForPoint([alert], { ...INSIDE, now: AFTER_EXPIRY }).length, 0);
  const [selected] = selectAlertsForPoint([alert], { ...INSIDE, now: BEFORE_EXPIRY });
  assert.equal(selected.severityLabel, "Moderada");
  assert.equal(selected.expires, "2026-11-07T17:59:59.000Z");
});

test("descarta alertas reemplazadas, canceladas, de prueba y duplicadas", () => {
  const base = parseCapAlert(capXml);
  const older = { ...base, identifier: "old", references: [] };
  const update = { ...base, identifier: "new", references: ["old"] };
  const duplicate = { ...base, identifier: "dup", references: [] };
  const cancel = { ...base, identifier: "c", msgType: "Cancel", event: "Otro", references: [] };
  const exercise = { ...base, identifier: "e", status: "Exercise", event: "Prueba", references: [] };
  const result = selectAlertsForPoint([older, update, duplicate, cancel, exercise], {
    ...INSIDE,
    now: BEFORE_EXPIRY,
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "new");
});

test("el servicio consulta el feed una sola vez y marca resultados parciales", async () => {
  let feedCalls = 0;
  const rss = `<rss><channel>
    <item><link>https://ssl.smn.gob.ar/feeds/CAP/ok.xml</link></item>
    <item><link>https://ssl.smn.gob.ar/feeds/CAP/ok2.xml</link></item>
    <item><link>https://ssl.smn.gob.ar/feeds/CAP/broken.xml</link></item>
  </channel></rss>`;
  const fetchImpl = async (url) => {
    if (url === SMN_FEED_URL) {
      feedCalls += 1;
      return fakeResponse(200, rss);
    }
    if (url.endsWith("broken.xml")) return fakeResponse(404, "no");
    return fakeResponse(200, capXml);
  };
  const service = createAlertsService({
    provider: createSmnAlertsProvider({ fetchImpl, logger: silentLogger }),
    cache: new TtlCache({ ttlMs: 60_000 }),
    now: () => BEFORE_EXPIRY,
  });
  const first = await service.getAlerts(INSIDE);
  const second = await service.getAlerts(OUTSIDE);
  assert.equal(feedCalls, 1);
  assert.equal(first.alerts.length, 1);
  assert.equal(first.partial, true);
  assert.equal(second.alerts.length, 0);
  assert.equal(first.source.url, "https://www.smn.gob.ar/alertas");
});

test("si falla la mayoría de los documentos, el servicio informa error en vez de 'sin alertas'", async () => {
  const rss = `<rss><channel>
    <item><link>https://ssl.smn.gob.ar/feeds/CAP/a.xml</link></item>
    <item><link>https://ssl.smn.gob.ar/feeds/CAP/b.xml</link></item>
  </channel></rss>`;
  const fetchImpl = async (url) => (url === SMN_FEED_URL ? fakeResponse(200, rss) : fakeResponse(404, ""));
  const provider = createSmnAlertsProvider({ fetchImpl, logger: silentLogger });
  await assert.rejects(provider.getActiveAlerts(), { code: "UPSTREAM_INVALID_DATA" });
});

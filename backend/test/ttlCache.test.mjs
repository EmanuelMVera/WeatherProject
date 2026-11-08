import { test } from "node:test";
import assert from "node:assert/strict";
import { TtlCache } from "../src/lib/ttlCache.mjs";

function clock(start = 0) {
  let t = start;
  return { now: () => t, advance: (ms) => (t += ms) };
}

test("devuelve HIT dentro del TTL y MISS al vencer", async () => {
  const c = clock();
  const cache = new TtlCache({ ttlMs: 1000, now: c.now });
  let calls = 0;
  const loader = async () => ++calls;

  assert.equal((await cache.getOrLoad("k", loader)).status, "MISS");
  assert.equal((await cache.getOrLoad("k", loader)).status, "HIT");
  c.advance(1001);
  const again = await cache.getOrLoad("k", loader);
  assert.equal(again.status, "MISS");
  assert.equal(again.value, 2);
});

test("nunca almacena errores", async () => {
  const cache = new TtlCache({ ttlMs: 1000 });
  await assert.rejects(cache.getOrLoad("k", async () => { throw new Error("boom"); }));
  assert.equal(cache.size, 0);
  const ok = await cache.getOrLoad("k", async () => "ok");
  assert.equal(ok.value, "ok");
});

test("deduplica cargas concurrentes de la misma clave", async () => {
  const cache = new TtlCache({ ttlMs: 1000 });
  let calls = 0;
  const loader = () => new Promise((resolve) => setTimeout(() => resolve(++calls), 10));
  const results = await Promise.all([1, 2, 3].map(() => cache.getOrLoad("k", loader)));
  assert.equal(calls, 1);
  assert.deepEqual(results.map((r) => r.value), [1, 1, 1]);
});

test("sirve datos vencidos (STALE) si el proveedor falla dentro de la ventana", async () => {
  const c = clock();
  const cache = new TtlCache({ ttlMs: 1000, staleTtlMs: 5000, now: c.now });
  await cache.getOrLoad("k", async () => "viejo");
  c.advance(2000);
  const result = await cache.getOrLoad("k", async () => { throw new Error("caído"); });
  assert.equal(result.status, "STALE");
  assert.equal(result.value, "viejo");
  assert.equal(result.storedAt, 0);

  c.advance(10_000); // fuera de la ventana stale
  await assert.rejects(cache.getOrLoad("k", async () => { throw new Error("caído"); }));
});

test("respeta el máximo de entradas expulsando la menos usada", async () => {
  const cache = new TtlCache({ ttlMs: 10_000, maxEntries: 2 });
  cache.set("a", 1);
  cache.set("b", 2);
  cache.get("a"); // "a" pasa a ser la más reciente
  cache.set("c", 3);
  assert.equal(cache.size, 2);
  assert.equal(cache.get("b"), undefined);
  assert.equal(cache.get("a"), 1);
  assert.equal(cache.get("c"), 3);
});

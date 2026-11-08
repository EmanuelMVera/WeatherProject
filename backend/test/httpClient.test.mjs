import { test } from "node:test";
import assert from "node:assert/strict";
import { httpGet } from "../src/lib/httpClient.mjs";
import { fakeResponse, silentLogger } from "./helpers.mjs";

const base = { provider: "test", baseDelayMs: 1, logger: silentLogger };

test("reintenta ante 503 y luego devuelve el JSON", async () => {
  let calls = 0;
  const fetchImpl = async () => (++calls < 3 ? fakeResponse(503, "x") : fakeResponse(200, { ok: 1 }));
  const data = await httpGet("https://example.org/a", { ...base, retries: 2, fetchImpl });
  assert.deepEqual(data, { ok: 1 });
  assert.equal(calls, 3);
});

test("no reintenta errores 4xx no transitorios", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return fakeResponse(400, { reason: "bad" });
  };
  await assert.rejects(httpGet("https://example.org/a", { ...base, retries: 3, fetchImpl }), (err) => {
    assert.equal(err.code, "UPSTREAM_UNAVAILABLE");
    assert.equal(err.upstreamStatus, 400);
    return true;
  });
  assert.equal(calls, 1);
});

test("convierte un timeout en UPSTREAM_TIMEOUT", async () => {
  // AbortSignal.timeout usa un timer "unref": mantenemos vivo el event loop.
  const fetchImpl = (url, { signal }) =>
    new Promise((_, reject) => {
      const keepAlive = setTimeout(() => {}, 5000);
      signal.addEventListener("abort", () => {
        clearTimeout(keepAlive);
        reject(signal.reason);
      });
    });
  await assert.rejects(
    httpGet("https://example.org/slow", { ...base, retries: 0, timeoutMs: 20, fetchImpl }),
    (err) => err.code === "UPSTREAM_TIMEOUT"
  );
});

test("rechaza URLs que no son HTTPS", async () => {
  let called = false;
  const fetchImpl = async () => {
    called = true;
    return fakeResponse(200, {});
  };
  await assert.rejects(httpGet("http://insecure.example.org", { ...base, fetchImpl }));
  assert.equal(called, false);
});

test("los mensajes de error no incluyen la URL (puede contener API keys)", async () => {
  const fetchImpl = async () => {
    throw new TypeError("fetch failed");
  };
  await assert.rejects(
    httpGet("https://example.org/x?apikey=SECRETO", { ...base, retries: 0, fetchImpl }),
    (err) => !String(err.message).includes("SECRETO") && !JSON.stringify(err).includes("SECRETO")
  );
});

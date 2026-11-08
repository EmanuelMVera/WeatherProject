import { UpstreamError, UpstreamTimeoutError } from "../errors.mjs";

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET a un proveedor externo con timeout y reintentos sólo ante fallas
 * transitorias (red, timeout, 408/425/429/5xx). Los 4xx restantes no se
 * reintentan porque repetir la misma petición daría el mismo resultado.
 *
 * Nunca registra ni incluye la URL en errores: puede contener API keys.
 *
 * @param {string} url
 * @param {object} opts
 * @param {string} opts.provider        Nombre legible para logs (ej: "open-meteo").
 * @param {number} [opts.timeoutMs=8000]
 * @param {number} [opts.retries=2]     Reintentos además del intento inicial.
 * @param {number} [opts.baseDelayMs=300]
 * @param {"json"|"text"} [opts.as="json"]
 * @param {Record<string,string>} [opts.headers]
 * @param {typeof fetch} [opts.fetchImpl]
 * @param {{ warn: Function }} [opts.logger]
 */
export async function httpGet(url, opts) {
  const {
    provider,
    timeoutMs = 8000,
    retries = 2,
    baseDelayMs = 300,
    as = "json",
    headers = {},
    fetchImpl = globalThis.fetch,
    logger = console,
  } = opts;

  if (!String(url).startsWith("https://")) {
    // Defensa en profundidad: nunca hablar con proveedores por HTTP plano.
    throw new UpstreamError(provider, { cause: new Error("Se rechazó una URL no HTTPS") });
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let retryable = false;
    try {
      const response = await fetchImpl(url, {
        method: "GET",
        headers: { Accept: as === "json" ? "application/json" : "*/*", ...headers },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok) {
        return as === "json" ? await response.json() : await response.text();
      }

      retryable = RETRYABLE_STATUS.has(response.status);
      // Consumimos el cuerpo para liberar la conexión, sin registrarlo.
      await response.text().catch(() => {});
      lastError = new UpstreamError(provider, { status: response.status });
    } catch (err) {
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        lastError = new UpstreamTimeoutError(provider);
      } else if (err instanceof SyntaxError) {
        // JSON inválido: no tiene sentido reintentar.
        lastError = new UpstreamError(provider, { cause: err });
        retryable = false;
        break;
      } else {
        lastError = new UpstreamError(provider, { cause: err });
      }
      retryable = true;
    }

    if (!retryable || attempt === retries) break;

    const delay = baseDelayMs * 2 ** attempt;
    logger.warn?.(
      `[http] ${provider}: intento ${attempt + 1} falló (${lastError.code}${
        lastError.upstreamStatus ? ` ${lastError.upstreamStatus}` : ""
      }); reintento en ${delay} ms`
    );
    await sleep(delay);
  }

  throw lastError;
}

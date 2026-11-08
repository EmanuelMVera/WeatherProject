/**
 * Utilidades HTTP con resiliencia frente al cold start del plan gratuito de
 * Render: timeout, cancelación externa, reintentos con backoff + jitter y
 * clasificación de errores.
 */

// A partir de este tiempo asumimos que el backend está "despertando".
export const COLD_START_HINT_MS = 3500;

// Códigos que suele devolver un proxy con el servidor dormido / arrancando.
// 429 no se reintenta automáticamente: reintentar empeora el límite.
const RETRYABLE_STATUS = new Set([408, 425, 500, 502, 503, 504]);

export class HttpError extends Error {
  constructor(message, { status = 0, code, retryable = false, cause } = {}) {
    super(message || "No pudimos obtener los datos.");
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
    if (cause) this.cause = cause;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Extrae `{ error: { code, message } }` (o formatos más simples). */
export async function parseErrorBody(response) {
  let text = "";
  try {
    text = await response.text();
    const data = JSON.parse(text);
    if (data?.error && typeof data.error === "object") {
      return { code: data.error.code, message: data.error.message };
    }
    return { code: undefined, message: data?.message || data?.error };
  } catch {
    return { code: undefined, message: undefined };
  }
}

/** Lanza HttpError si la respuesta no es OK. */
export async function ensureOk(response) {
  if (response.ok) return response;
  const { code, message } = await parseErrorBody(response);
  const fallback =
    response.status === 429
      ? "Hiciste demasiadas consultas seguidas. Esperá unos minutos."
      : response.status >= 500
        ? "El servidor no está disponible en este momento."
        : "No pudimos completar la consulta.";
  throw new HttpError(message || fallback, {
    status: response.status,
    code,
    // Un 502/504 del proxy puede ser el servidor arrancando; los del backend
    // (código UPSTREAM_*) también son transitorios.
    retryable: RETRYABLE_STATUS.has(response.status),
  });
}

export function isRetryable(err) {
  if (err instanceof HttpError) return err.retryable;
  if (err?.isTimeout) return true;
  // TypeError "Failed to fetch": red caída, DNS o servidor sin responder.
  return err?.name === "TypeError";
}

/** Mensaje comprensible para cualquier error de la capa HTTP. */
export function friendlyMessage(err) {
  if (err instanceof HttpError && err.message) return err.message;
  if (err?.isTimeout) {
    return "El servidor tardó demasiado en responder. Puede estar iniciándose: probá de nuevo en unos segundos.";
  }
  if (err?.name === "TypeError") {
    return "No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.";
  }
  return err?.message || "No pudimos obtener los datos.";
}

/**
 * fetch con timeout. Una cancelación del caller (options.signal) se propaga
 * tal cual y no se reporta como timeout.
 */
export async function fetchWithTimeout(url, timeoutMs = 15000, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const external = options.signal;
  const onAbort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", onAbort, { once: true });
  }

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (external?.aborted) throw err;
    if (err?.name === "AbortError") {
      const timeoutErr = new Error("Tiempo de espera agotado");
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    external?.removeEventListener?.("abort", onAbort);
  }
}

/**
 * Ejecuta `fn` reintentando ante errores transitorios.
 * @template T
 * @param {(ctx: { attempt: number }) => Promise<T>} fn  attempt 0 = intento inicial
 * @param {{ retries?: number, baseDelayMs?: number, maxDelayMs?: number, signal?: AbortSignal,
 *           onRetry?: (info: { attempt: number, error: Error }) => void }} [opts]
 */
export async function withRetry(fn, opts = {}) {
  const { retries = 3, baseDelayMs = 1200, maxDelayMs = 8000, signal, onRetry } = opts;
  let attempt = 0;
  for (;;) {
    try {
      return await fn({ attempt });
    } catch (err) {
      if (signal?.aborted) throw err;
      attempt += 1;
      if (attempt > retries || !isRetryable(err)) throw err;
      const backoff = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      // Jitter ±30 % para no sincronizar reintentos entre pestañas.
      const delayMs = Math.round(backoff * (0.7 + Math.random() * 0.6));
      onRetry?.({ attempt, error: err });
      await wait(delayMs);
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    }
  }
}

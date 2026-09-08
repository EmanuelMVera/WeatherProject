/**
 * Utilidades HTTP con resiliencia frente al cold start del free tier de Render:
 * - fetch con timeout (y soporte de señal externa para cancelar)
 * - reintentos con backoff exponencial + jitter
 * - clasificación de errores (red / timeout / 5xx = reintentable)
 */

// A partir de este tiempo asumimos que el backend está "despertando".
export const COLD_START_HINT_MS = 3500;

// Reintentos adicionales por defecto (además del intento inicial).
export const DEFAULT_RETRIES = 3;

// Códigos que suele devolver un proxy con el servidor dormido / arrancando.
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * Error HTTP con contexto de estado y si conviene reintentar.
 */
export class HttpError extends Error {
  constructor(message, { status = 0, retryable = false, cause } = {}) {
    super(message || "Error al obtener datos");
    this.name = "HttpError";
    this.status = status;
    this.retryable = retryable;
    if (cause) this.cause = cause;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Parsea el body de un error y extrae un mensaje legible.
 */
export async function parseErrorBody(response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data.message || data.error || "Error al obtener datos";
  } catch {
    return text || "Error al obtener datos";
  }
}

/**
 * Lanza un HttpError si la respuesta no es OK (marcándolo reintentable en 5xx/429).
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export async function ensureOk(response) {
  if (response.ok) return response;
  const message = await parseErrorBody(response);
  throw new HttpError(message, {
    status: response.status,
    retryable: RETRYABLE_STATUS.has(response.status),
  });
}

/**
 * ¿Este error justifica un reintento? (red caída, timeout, 5xx, servidor dormido)
 * @param {Error} err
 */
export function isRetryable(err) {
  if (err instanceof HttpError) return err.retryable;
  if (err?.isTimeout) return true;
  // TypeError: "Failed to fetch" -> red caída, DNS, servidor sin responder.
  if (err?.name === "TypeError") return true;
  return false;
}

/**
 * Convierte cualquier error de la capa HTTP en un mensaje amigable para el usuario.
 * @param {Error} err
 */
export function friendlyMessage(err) {
  if (err instanceof HttpError && err.message) return err.message;
  if (err?.isTimeout) {
    return "El servidor tardó demasiado en responder. Puede estar iniciándose; probá de nuevo en unos segundos.";
  }
  if (err?.name === "TypeError") {
    return "No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente en unos segundos.";
  }
  return err?.message || "Error al obtener datos";
}

/**
 * fetch con timeout. Soporta una señal externa (options.signal) para que el
 * caller pueda cancelar; en ese caso NO se reporta como timeout.
 * @param {string} url
 * @param {number} timeoutMs
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, timeoutMs = 15000, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const external = options.signal;
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    // Cancelación real pedida por el caller -> propagar tal cual.
    if (external?.aborted) throw err;
    if (err.name === "AbortError") {
      const timeoutErr = new Error(`Timeout esperando respuesta de ${url} (${timeoutMs}ms)`);
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Ejecuta `fn` reintentando ante errores reintentables con backoff exponencial + jitter.
 *
 * @template T
 * @param {(ctx: { attempt: number, signal?: AbortSignal }) => Promise<T>} fn
 *        `attempt` empieza en 0 (intento inicial), 1 = primer reintento, etc.
 * @param {object} [opts]
 * @param {number} [opts.retries=DEFAULT_RETRIES]  Reintentos adicionales al intento inicial.
 * @param {number} [opts.baseDelayMs=1200]         Espera base (se duplica por reintento).
 * @param {number} [opts.maxDelayMs=8000]          Tope de espera entre reintentos.
 * @param {AbortSignal} [opts.signal]              Cancela el ciclo completo.
 * @param {(info: { attempt: number, retries: number, error: Error, delayMs: number }) => void} [opts.onRetry]
 * @param {(err: Error) => boolean} [opts.shouldRetry]
 * @returns {Promise<T>}
 */
export async function withRetry(fn, opts = {}) {
  const {
    retries = DEFAULT_RETRIES,
    baseDelayMs = 1200,
    maxDelayMs = 8000,
    signal,
    onRetry,
    shouldRetry = isRetryable,
  } = opts;

  let attempt = 0;
  for (;;) {
    try {
      return await fn({ attempt, signal });
    } catch (err) {
      if (signal?.aborted) throw err;
      attempt += 1;

      if (attempt > retries || !shouldRetry(err)) throw err;

      const backoff = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      // Jitter ±30% para no sincronizar reintentos entre pestañas/usuarios.
      const delayMs = Math.round(backoff * (0.7 + Math.random() * 0.6));

      onRetry?.({ attempt, retries, error: err, delayMs });
      await wait(delayMs);
    }
  }
}

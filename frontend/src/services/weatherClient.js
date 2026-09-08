import {
  ensureOk,
  fetchWithTimeout,
  friendlyMessage,
  HttpError,
  withRetry,
} from "../utils/http.js";

// El primer intento usa un timeout corto (servidor despierto responde rápido).
// Los reintentos usan un timeout largo: el free tier de Render puede tardar
// 30-50s en levantar del sleep.
const FIRST_ATTEMPT_TIMEOUT_MS = 12000;
const WAKEUP_TIMEOUT_MS = 45000;

function rethrowFriendly(err) {
  const friendly = new Error(friendlyMessage(err));
  friendly.status = err?.status;
  friendly.cause = err;
  return friendly;
}

/**
 * @param {string} apiUrl
 * @param {string} city
 * @param {{ signal?: AbortSignal, onWakingUp?: () => void }} [opts]
 */
export async function fetchWeatherBundle(apiUrl, city, opts = {}) {
  const { signal, onWakingUp } = opts;
  const q = encodeURIComponent(city);
  const urls = [
    `${apiUrl}/currentWeather?city=${q}`,
    `${apiUrl}/forecastWeather?city=${q}`,
  ];

  try {
    return await withRetry(
      async ({ attempt }) => {
        const timeoutMs =
          attempt === 0 ? FIRST_ATTEMPT_TIMEOUT_MS : WAKEUP_TIMEOUT_MS;

        const responses = await Promise.all(
          urls.map((url) => fetchWithTimeout(url, timeoutMs, { signal }))
        );

        for (const response of responses) {
          if (response.ok) continue;
          if (response.status === 404) {
            throw new HttpError("Ciudad no encontrada", { status: 404 });
          }
          if (response.status === 429) {
            throw new HttpError(
              "Demasiadas solicitudes. Esperá un momento antes de reintentar.",
              { status: 429, retryable: false }
            );
          }
          // 5xx / otros -> HttpError reintentable (típico de Render despertando).
          await ensureOk(response);
        }

        const [current, forecast] = await Promise.all(
          responses.map((response) => response.json())
        );
        return { current, forecast };
      },
      {
        signal,
        retries: 3,
        baseDelayMs: 1500,
        onRetry: ({ attempt }) => {
          // Del primer reintento en adelante: casi siempre es cold start.
          if (attempt >= 1) onWakingUp?.();
        },
      }
    );
  } catch (err) {
    throw rethrowFriendly(err);
  }
}

/**
 * @param {string} apiUrl
 * @param {{ signal?: AbortSignal, onWakingUp?: () => void }} [opts]
 * @returns {Promise<string|undefined>}
 */
export async function fetchCityFromIp(apiUrl, opts = {}) {
  const { signal, onWakingUp } = opts;
  try {
    const location = await withRetry(
      async ({ attempt }) => {
        const timeoutMs = attempt === 0 ? 10000 : WAKEUP_TIMEOUT_MS;
        const response = await fetchWithTimeout(
          `${apiUrl}/ipGeolocation`,
          timeoutMs,
          { signal }
        );
        if (response.status === 429) {
          throw new HttpError(
            "Demasiadas solicitudes de ubicación. Usando ubicación predeterminada.",
            { status: 429, retryable: false }
          );
        }
        await ensureOk(response);
        return response.json();
      },
      {
        signal,
        retries: 2,
        baseDelayMs: 1500,
        onRetry: ({ attempt }) => {
          if (attempt >= 1) onWakingUp?.();
        },
      }
    );
    return location?.cityName;
  } catch (err) {
    throw rethrowFriendly(err);
  }
}

/**
 * "Despierta" el backend de Render (free tier) sin gastar cuota de rate-limit.
 * Fire-and-forget: nunca rechaza.
 * @param {string} apiUrl
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<boolean>} true si el servidor respondió OK.
 */
export async function warmUpServer(apiUrl, opts = {}) {
  if (!apiUrl) return false;
  try {
    const response = await fetchWithTimeout(`${apiUrl}/health`, WAKEUP_TIMEOUT_MS, {
      signal: opts.signal,
    });
    return response.ok;
  } catch {
    return false;
  }
}

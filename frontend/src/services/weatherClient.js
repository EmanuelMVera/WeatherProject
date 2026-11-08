import { ensureOk, fetchWithTimeout, friendlyMessage, HttpError, withRetry } from "./http.js";

/**
 * Cliente del backend de Buen Clima.
 * VITE_API_URL vacía => mismo origen (/api), que en desarrollo Vite reenvía
 * al backend local.
 */
export const API_BASE_URL = String(import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");

// Primer intento corto (servidor despierto responde rápido); los reintentos
// esperan más porque el plan gratuito de Render tarda 30-50 s en arrancar.
const FIRST_ATTEMPT_TIMEOUT_MS = 12000;
const WAKEUP_TIMEOUT_MS = 45000;

function toFriendly(err) {
  if (err?.name === "AbortError") return err;
  const friendly = new Error(friendlyMessage(err));
  friendly.status = err?.status;
  friendly.code = err?.code ?? (err?.isTimeout ? "TIMEOUT" : err?.name === "TypeError" ? "NETWORK" : undefined);
  friendly.cause = err;
  return friendly;
}

function coordsQuery({ latitude, longitude }) {
  return new URLSearchParams({ lat: latitude.toFixed(4), lon: longitude.toFixed(4) }).toString();
}

/** Valida la forma mínima del contrato antes de entregarlo a la UI. */
export function assertWeatherShape(body) {
  const ok =
    body &&
    typeof body.location?.timezone === "string" &&
    Array.isArray(body.hourly) &&
    Array.isArray(body.daily) &&
    body.daily.length > 0 &&
    body.meta?.source;
  if (!ok) {
    throw new HttpError("Recibimos datos con un formato inesperado.", { code: "INVALID_DATA" });
  }
  return body;
}

/**
 * @param {{ latitude: number, longitude: number }} place
 * @param {{ signal?: AbortSignal, onWakingUp?: () => void }} [opts]
 */
export async function fetchWeather(place, { signal, onWakingUp } = {}) {
  const url = `${API_BASE_URL}/api/weather?${coordsQuery(place)}`;
  try {
    return await withRetry(
      async ({ attempt }) => {
        const response = await fetchWithTimeout(
          url,
          attempt === 0 ? FIRST_ATTEMPT_TIMEOUT_MS : WAKEUP_TIMEOUT_MS,
          { signal }
        );
        await ensureOk(response);
        return assertWeatherShape(await response.json());
      },
      { signal, retries: 3, baseDelayMs: 1500, onRetry: () => onWakingUp?.() }
    );
  } catch (err) {
    throw toFriendly(err);
  }
}

/**
 * Alertas oficiales del SMN para un punto de Argentina.
 * @param {{ latitude: number, longitude: number }} place
 */
export async function fetchAlerts(place, { signal } = {}) {
  const url = `${API_BASE_URL}/api/alerts?${coordsQuery(place)}`;
  try {
    return await withRetry(
      async () => {
        const response = await fetchWithTimeout(url, WAKEUP_TIMEOUT_MS, { signal });
        await ensureOk(response);
        const body = await response.json();
        if (!Array.isArray(body?.alerts)) {
          throw new HttpError("Formato de alertas inesperado.", { code: "INVALID_DATA" });
        }
        return body;
      },
      { signal, retries: 1, baseDelayMs: 2000 }
    );
  } catch (err) {
    throw toFriendly(err);
  }
}

/** "Despierta" el backend sin consumir rate limit. Nunca rechaza. */
export async function warmUpServer({ signal } = {}) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`, WAKEUP_TIMEOUT_MS, { signal });
    return response.ok;
  } catch {
    return false;
  }
}

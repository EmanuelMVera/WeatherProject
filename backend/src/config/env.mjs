/**
 * Carga y valida la configuración del servidor a partir de variables de entorno.
 * Todas las variables son opcionales salvo ALLOWED_ORIGINS en producción.
 * Devuelve un objeto inmutable para que el resto del código no lea process.env.
 */

const DEFAULT_DEV_ORIGINS = ["http://localhost:5173", "http://localhost:4173"];

function parseIntInRange(raw, name, { min, max, fallback }) {
  if (raw == null || String(raw).trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} debe ser un entero entre ${min} y ${max} (recibido: "${raw}").`);
  }
  return value;
}

function parseOrigins(raw) {
  return String(raw ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function assertHttpsUrl(raw, name) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${name} no es una URL válida.`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`${name} debe usar HTTPS.`);
  }
  return url.toString().replace(/\/$/, "");
}

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  const warnings = [];

  // ALLOWED_ORIGINS es la variable oficial. ALLOWED_ORIGIN (singular) quedó de
  // una versión anterior: se acepta como alias para no romper despliegues.
  let allowedOrigins = parseOrigins(env.ALLOWED_ORIGINS);
  if (allowedOrigins.length === 0 && env.ALLOWED_ORIGIN) {
    allowedOrigins = parseOrigins(env.ALLOWED_ORIGIN);
    warnings.push("ALLOWED_ORIGIN está obsoleta: usá ALLOWED_ORIGINS (lista separada por comas).");
  }
  if (allowedOrigins.length === 0) {
    if (isProduction) {
      throw new Error("ALLOWED_ORIGINS es obligatoria en producción (ej: https://buenclima.vercel.app).");
    }
    allowedOrigins = DEFAULT_DEV_ORIGINS;
  }
  for (const origin of allowedOrigins) {
    if (!/^https?:\/\/[^/\s]+$/.test(origin)) {
      throw new Error(`Origen inválido en ALLOWED_ORIGINS: "${origin}".`);
    }
  }

  const openMeteoBaseUrl = assertHttpsUrl(
    env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1",
    "OPEN_METEO_BASE_URL"
  );

  const config = {
    nodeEnv,
    isProduction,
    port: parseIntInRange(env.PORT, "PORT", { min: 1, max: 65535, fallback: 5000 }),
    // Cantidad de proxies delante del servidor (Render usa uno). Necesario para
    // que el rate limit vea la IP real del cliente y no la del balanceador.
    trustProxy: parseIntInRange(env.TRUST_PROXY, "TRUST_PROXY", { min: 0, max: 10, fallback: 1 }),
    allowedOrigins,
    openMeteo: {
      baseUrl: openMeteoBaseUrl,
      // Sólo para el plan comercial de Open-Meteo (customer-api). Opcional.
      apiKey: env.OPEN_METEO_API_KEY?.trim() || null,
    },
    upstreamTimeoutMs: parseIntInRange(env.UPSTREAM_TIMEOUT_MS, "UPSTREAM_TIMEOUT_MS", {
      min: 1000,
      max: 30000,
      fallback: 8000,
    }),
    cache: {
      weatherTtlMs:
        parseIntInRange(env.WEATHER_CACHE_TTL_SECONDS, "WEATHER_CACHE_TTL_SECONDS", {
          min: 30,
          max: 6 * 3600,
          fallback: 600,
        }) * 1000,
      alertsTtlMs:
        parseIntInRange(env.ALERTS_CACHE_TTL_SECONDS, "ALERTS_CACHE_TTL_SECONDS", {
          min: 60,
          max: 3600,
          fallback: 600,
        }) * 1000,
      // Ventana durante la cual se puede servir un dato vencido si el proveedor falla.
      staleTtlMs:
        parseIntInRange(env.CACHE_STALE_SECONDS, "CACHE_STALE_SECONDS", {
          min: 0,
          max: 24 * 3600,
          fallback: 3 * 3600,
        }) * 1000,
      maxEntries: parseIntInRange(env.CACHE_MAX_ENTRIES, "CACHE_MAX_ENTRIES", {
        min: 10,
        max: 100000,
        fallback: 500,
      }),
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: parseIntInRange(env.RATE_LIMIT_MAX, "RATE_LIMIT_MAX", { min: 1, max: 100000, fallback: 300 }),
    },
  };

  return { config: Object.freeze(config), warnings };
}

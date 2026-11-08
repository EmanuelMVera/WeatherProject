import { UpstreamDataError } from "../errors.mjs";
import { describeWeatherCode } from "../domain/weatherCodes.mjs";
import { isValidTimeZone, toLocalParts } from "../utils/timezone.mjs";

/**
 * Convierte la respuesta cruda de Open-Meteo en el contrato interno estable
 * que consume el frontend.
 *
 * Reglas:
 * - Valores faltantes o no numéricos -> `null` (nunca 0, porque 0 °C o 0 mm
 *   son mediciones válidas y se interpretarían como datos reales).
 * - Instantes en ISO 8601 UTC; además se incluye la fecha/hora local
 *   calculada con la zona IANA de la localidad.
 * - Mínimas y máximas diarias vienen directo de las variables diarias del
 *   proveedor, no se recalculan con una franja horaria.
 */

const PROVIDER = "open-meteo";

/** Número finito o null. */
export function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round(value, decimals = 1) {
  if (value == null) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toIso(epochSeconds) {
  const sec = num(epochSeconds);
  return sec == null ? null : new Date(sec * 1000).toISOString();
}

function toBool(value) {
  if (value === 1 || value === true) return true;
  if (value === 0 || value === false) return false;
  return null;
}

function assert(condition, detail) {
  if (!condition) throw new UpstreamDataError(PROVIDER, detail);
}

/** Lee la columna `key` de un bloque columnar ({ time: [], key: [] }). */
function column(block, key, length) {
  const values = block?.[key];
  if (!Array.isArray(values)) return new Array(length).fill(null);
  return Array.from({ length }, (_, i) => values[i]);
}

function normalizeCurrent(current, timeZone) {
  if (!current || num(current.time) == null) return null;
  const isDay = toBool(current.is_day);
  const weatherCode = num(current.weather_code);
  return {
    time: toIso(current.time),
    local: toLocalParts(current.time * 1000, timeZone),
    temperature: round(num(current.temperature_2m)),
    apparentTemperature: round(num(current.apparent_temperature)),
    humidity: num(current.relative_humidity_2m),
    weatherCode,
    condition: describeWeatherCode(weatherCode, isDay),
    isDay,
    windSpeed: round(num(current.wind_speed_10m)),
    windDirection: num(current.wind_direction_10m),
    windGusts: round(num(current.wind_gusts_10m)),
    pressure: round(num(current.pressure_msl)),
    cloudCover: num(current.cloud_cover),
    uvIndex: round(num(current.uv_index)),
  };
}

function normalizeHourly(hourly, timeZone, nowMs) {
  const times = hourly.time;
  const n = times.length;
  const cols = Object.fromEntries(
    [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
      "is_day",
      "precipitation_probability",
      "precipitation",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "uv_index",
    ].map((key) => [key, column(hourly, key, n)])
  );

  const result = [];
  for (let i = 0; i < n; i += 1) {
    const epoch = num(times[i]);
    if (epoch == null) continue;
    // Conservamos desde la hora en curso: una hora que empezó hace menos de
    // 60 min todavía es relevante.
    if (epoch * 1000 + 3600 * 1000 <= nowMs) continue;

    const weatherCode = num(cols.weather_code[i]);
    const isDay = toBool(cols.is_day[i]);
    const local = toLocalParts(epoch * 1000, timeZone);
    result.push({
      time: toIso(epoch),
      localDate: local.date,
      localHour: local.hour,
      temperature: round(num(cols.temperature_2m[i])),
      apparentTemperature: round(num(cols.apparent_temperature[i])),
      weatherCode,
      condition: describeWeatherCode(weatherCode, isDay),
      isDay,
      precipitationProbability: num(cols.precipitation_probability[i]),
      precipitation: round(num(cols.precipitation[i])),
      windSpeed: round(num(cols.wind_speed_10m[i])),
      windDirection: num(cols.wind_direction_10m[i]),
      windGusts: round(num(cols.wind_gusts_10m[i])),
      uvIndex: round(num(cols.uv_index[i])),
    });
  }
  return result;
}

function normalizeDaily(daily, timeZone) {
  const times = daily.time;
  const n = times.length;
  const get = (key) => column(daily, key, n);
  const c = {
    code: get("weather_code"),
    tMax: get("temperature_2m_max"),
    tMin: get("temperature_2m_min"),
    aMax: get("apparent_temperature_max"),
    aMin: get("apparent_temperature_min"),
    pSum: get("precipitation_sum"),
    pProb: get("precipitation_probability_max"),
    pHours: get("precipitation_hours"),
    wMax: get("wind_speed_10m_max"),
    gMax: get("wind_gusts_10m_max"),
    wDir: get("wind_direction_10m_dominant"),
    uvMax: get("uv_index_max"),
    sunrise: get("sunrise"),
    sunset: get("sunset"),
    daylight: get("daylight_duration"),
  };

  const days = [];
  for (let i = 0; i < n; i += 1) {
    const epoch = num(times[i]);
    if (epoch == null) continue;
    const weatherCode = num(c.code[i]);
    // En latitudes polares puede no haber amanecer/atardecer: Open-Meteo
    // devuelve valores degenerados. Sólo los aceptamos si son coherentes.
    const sunriseSec = num(c.sunrise[i]);
    const sunsetSec = num(c.sunset[i]);
    const validSun = sunriseSec != null && sunsetSec != null && sunsetSec > sunriseSec;

    days.push({
      // `time` es la medianoche local del día; `date` es su fecha local.
      date: toLocalParts(epoch * 1000, timeZone).date,
      time: toIso(epoch),
      weatherCode,
      condition: describeWeatherCode(weatherCode, true),
      temperatureMax: round(num(c.tMax[i])),
      temperatureMin: round(num(c.tMin[i])),
      apparentTemperatureMax: round(num(c.aMax[i])),
      apparentTemperatureMin: round(num(c.aMin[i])),
      precipitationSum: round(num(c.pSum[i])),
      precipitationProbabilityMax: num(c.pProb[i]),
      precipitationHours: num(c.pHours[i]),
      windSpeedMax: round(num(c.wMax[i])),
      windGustsMax: round(num(c.gMax[i])),
      windDirectionDominant: num(c.wDir[i]),
      uvIndexMax: round(num(c.uvMax[i])),
      sunrise: validSun ? toIso(sunriseSec) : null,
      sunset: validSun ? toIso(sunsetSec) : null,
      daylightDuration: num(c.daylight[i]),
    });
  }
  return days;
}

/**
 * @param {any} raw  JSON crudo de Open-Meteo (timeformat=unixtime, timezone=auto).
 * @param {{ now?: number }} [opts]
 */
export function normalizeOpenMeteoForecast(raw, { now = Date.now() } = {}) {
  assert(raw && typeof raw === "object", "respuesta vacía");
  assert(isValidTimeZone(raw.timezone), "zona horaria ausente o inválida");
  assert(Array.isArray(raw.hourly?.time), "falta el bloque horario");
  assert(Array.isArray(raw.daily?.time) && raw.daily.time.length > 0, "falta el bloque diario");
  assert(raw.hourly_units?.wind_speed_10m === undefined || raw.hourly_units.wind_speed_10m === "km/h",
    "unidad de viento inesperada");

  const timeZone = raw.timezone;

  return {
    location: {
      latitude: num(raw.latitude),
      longitude: num(raw.longitude),
      elevation: num(raw.elevation),
      timezone: timeZone,
      timezoneAbbreviation: typeof raw.timezone_abbreviation === "string" ? raw.timezone_abbreviation : null,
    },
    units: {
      temperature: "°C",
      windSpeed: "km/h",
      precipitation: "mm",
      pressure: "hPa",
      humidity: "%",
      cloudCover: "%",
      precipitationProbability: "%",
    },
    current: normalizeCurrent(raw.current, timeZone),
    hourly: normalizeHourly(raw.hourly, timeZone, now),
    daily: normalizeDaily(raw.daily, timeZone),
  };
}

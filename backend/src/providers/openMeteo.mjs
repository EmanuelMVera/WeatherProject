import { httpGet } from "../lib/httpClient.mjs";

/**
 * Cliente de la Forecast API de Open-Meteo. Sólo arma la petición y devuelve
 * el JSON crudo; la validación y normalización viven en el adaptador.
 * Docs: https://open-meteo.com/en/docs
 */

export const CURRENT_VARS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "weather_code",
  "is_day",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "pressure_msl",
  "cloud_cover",
  "uv_index",
];

export const HOURLY_VARS = [
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
];

export const DAILY_VARS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "precipitation_sum",
  "precipitation_probability_max",
  "precipitation_hours",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
  "uv_index_max",
  "sunrise",
  "sunset",
  "daylight_duration",
];

export const FORECAST_DAYS = 7;

/**
 * @param {{ baseUrl: string, apiKey?: string|null, timeoutMs?: number, fetchImpl?: typeof fetch, logger?: object }} opts
 */
export function createOpenMeteoProvider({ baseUrl, apiKey = null, timeoutMs = 8000, fetchImpl, logger }) {
  return {
    name: "open-meteo",

    /**
     * @param {{ lat: number, lon: number }} coords
     */
    async getForecast({ lat, lon }) {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        // Unidades explícitas: no dependemos de valores por defecto del proveedor.
        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
        precipitation_unit: "mm",
        // Instantes en epoch (UTC) + zona IANA de la localidad: las horas
        // locales se calculan con Intl y respetan el horario de verano.
        timeformat: "unixtime",
        timezone: "auto",
        forecast_days: String(FORECAST_DAYS),
        current: CURRENT_VARS.join(","),
        hourly: HOURLY_VARS.join(","),
        daily: DAILY_VARS.join(","),
      });
      if (apiKey) params.set("apikey", apiKey);

      return httpGet(`${baseUrl}/forecast?${params}`, {
        provider: "open-meteo",
        timeoutMs,
        retries: 2,
        fetchImpl,
        logger,
      });
    },
  };
}

export const CACHE_TTL_CURRENT = 10 * 60 * 1000; // 10 minutes
export const CACHE_TTL_FORECAST = 60 * 60 * 1000; // 1 hour
export const CACHE_TTL_IP = 24 * 60 * 60 * 1000; // 24 hours

export const API_BASE_URL_OPENWEATHER = 'https://api.openweathermap.org/data/2.5';
export const API_BASE_URL_WEATHERAPI = 'http://api.weatherapi.com/v1';

export const RATE_LIMIT_WEATHER = { windowMs: 15 * 60 * 1000, max: 30 };
export const RATE_LIMIT_IP = { windowMs: 15 * 60 * 1000, max: 60 };
export const RATE_LIMIT_GLOBAL = { windowMs: 15 * 60 * 1000, max: 100 };
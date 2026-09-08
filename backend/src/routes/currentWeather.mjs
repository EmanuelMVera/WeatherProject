import { getCurrentWeather } from "../controllers/currentWeatherController.mjs";
import { cacheMiddleware } from "../middleware/cacheMiddleware.mjs";
import { CACHE_TTL_CURRENT } from "../config/constants.mjs";
import { weatherCacheKey } from "../utils/weatherCacheKey.mjs";

const currentWeather = cacheMiddleware(
  (req) => `weather_current_${weatherCacheKey(req.query)}`,
  CACHE_TTL_CURRENT
)(getCurrentWeather);

export default currentWeather;

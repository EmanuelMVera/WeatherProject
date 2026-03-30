import { getCurrentWeather } from "../controllers/currentWeatherController.mjs";
import { cacheMiddleware } from "../middleware/cacheMiddleware.mjs";
import { CACHE_TTL_CURRENT } from "../config/constants.mjs";

const currentWeather = cacheMiddleware(
  (req) => `weather_current_${req.query.city.toLowerCase()}`,
  CACHE_TTL_CURRENT
)(getCurrentWeather);

export default currentWeather;

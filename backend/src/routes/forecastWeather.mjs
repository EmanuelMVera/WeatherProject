import { getForecastWeather } from "../controllers/forecastWeatherController.mjs";
import { cacheMiddleware } from "../middleware/cacheMiddleware.mjs";
import { CACHE_TTL_FORECAST } from "../config/constants.mjs";

const forecastWeather = cacheMiddleware(
  (req) => `weather_forecast_${req.query.city.toLowerCase()}`,
  CACHE_TTL_FORECAST
)(getForecastWeather);

export default forecastWeather;

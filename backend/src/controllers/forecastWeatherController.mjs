import { getForecastData } from "../services/weatherService.mjs";
import { resolveWeatherLocation } from "../utils/validators.mjs";

export const getForecastWeather = async (req, res) => {
  const resolved = resolveWeatherLocation(req.query);
  if (!resolved.valid) {
    return res.status(400).json({ error: resolved.error });
  }

  const { location, label } = resolved;

  try {
    const forecastData = await getForecastData(location);
    res.json(forecastData);
  } catch (error) {
    console.error(`Error fetching forecast for ${label}:`, error.message);
    res.status(404).json({ error: "Ciudad no encontrada" });
  }
};

import { getCurrentWeatherData } from "../services/weatherService.mjs";
import { resolveWeatherLocation } from "../utils/validators.mjs";

export const getCurrentWeather = async (req, res) => {
  const resolved = resolveWeatherLocation(req.query);
  if (!resolved.valid) {
    return res.status(400).json({ error: resolved.error });
  }

  const { location, label } = resolved;

  try {
    const currentWeatherData = await getCurrentWeatherData(location);
    res.json(currentWeatherData);
  } catch (error) {
    console.error(`Error fetching current weather for ${label}:`, error.message);
    res.status(404).json({ error: "Ciudad no encontrada" });
  }
};
